"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { LOADER_SHAPES } from "@/components/layout/loader-mark";
import { cn } from "@/lib/utils";

/**
 * Lit cloth with the logomark pressed into it, in one fragment shader.
 *
 * ## Where this comes from
 *
 * oddcommon's homepage does this with a real-time PBR cloth: a WebGL2 renderer,
 * a `.glb` mesh, and an 784 KB normal map beside a roughness map and a noise
 * map — about 2.7 MB of media across the page, plus the engine. It looks
 * extraordinary and it is not lightweight; it only feels that way because it is
 * smooth.
 *
 * The part worth copying is the *technique*, not the asset list: a surface with
 * a normal field, lit in real time, so highlights bend over the folds and the
 * light reacts to where you point it. None of that needs a mesh or a texture —
 * a height field is a function, and here it is a handful of octaves of value
 * noise plus the mark's own silhouette. Raw WebGL, no library, no downloads,
 * about 6 KB of source.
 *
 * That matters on this page specifically: `CLAUDE.md` §4.3 makes bundle weight a
 * business metric on a conversion funnel, and adding a 3D engine is a dependency
 * decision the owner has to make, not one a decorative section can make for
 * them.
 *
 * ## How it works
 *
 * `height()` in the shader is the whole thing:
 *
 * - a few octaves of stretched value noise, which is drapery;
 * - minus the blurred silhouette of the logomark, which is the press.
 *
 * The normal is a finite difference of that, and everything else is standard
 * Blinn-Phong — a fixed key light for the folds, and a second light at the
 * cursor with a tight falloff for the focused patch. Because the lime comes from
 * a *light* rather than a fill, it picks up the fold shading for free: the same
 * accent looks different where the cloth turns, which is exactly what a flat
 * clipped disc could never do.
 *
 * The mark is rasterised once into a small offscreen canvas from the same path
 * data the loader and the favicon use, blurred there with `ctx.filter`, and
 * uploaded as the only texture. No file, no request.
 */
export function ClothCanvas({ className }: { className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  /**
   * Pointer and light in **viewport** coordinates.
   *
   * The light marks a point on the *screen*, and on the filmstrip the panel
   * underneath it travels sideways whenever the page scrolls. Easing in element
   * space, and only on `pointermove`, gets that backwards: no event fires while
   * the page scrolls, so the light rides along with the cloth instead of staying
   * under the cursor.
   */
  const pointer = useRef({ x: 0, y: 0 });
  const light = useRef({ x: 0, y: 0 });
  const seen = useRef(false);

  useEffect(() => {
    const el = canvas.current;
    const box = host.current;
    if (!el || !box) return;

    /*
     * Everything below is created lazily, on the first frame this element
     * actually has a box.
     *
     * The block is `stripOnly`, so in vertical flow the frame hides it with
     * `display: none` — and a hidden element still mounts. Building the context
     * eagerly meant every phone and every reduced-motion visitor paid for a
     * WebGL context, a shader compile and a rasterised mark for a canvas they
     * would never see. `display: none` also never fires an IntersectionObserver,
     * so waiting for "visible" would have waited forever; having a width is the
     * signal that works.
     */
    let gl: WebGLRenderingContext | null = null;
    let program: WebGLProgram | null = null;
    let texture: WebGLTexture | null = null;
    let quad: WebGLBuffer | null = null;
    let u: Uniforms | null = null;
    let tried = false;

    function ensure(): boolean {
      if (tried) return Boolean(gl && program && u);
      tried = true;

      // No WebGL, or a driver that rejects the shader: the cell underneath is
      // paper and the copy sits on it, so the section degrades to a plain panel
      // rather than to a hole. The tracking loop keeps running either way.
      gl = el!.getContext("webgl", { antialias: false, alpha: false, depth: false });
      if (!gl) return false;

      program = build(gl);
      if (!program) return false;

      quad = setup(gl, program);
      texture = markTexture(gl);
      u = {
        res: gl.getUniformLocation(program, "uRes"),
        time: gl.getUniformLocation(program, "uTime"),
        light: gl.getUniformLocation(program, "uLight"),
        mask: gl.getUniformLocation(program, "uMask"),
        rect: gl.getUniformLocation(program, "uMaskRect"),
        drift: gl.getUniformLocation(program, "uDrift"),
      };

      gl.useProgram(program);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(u.mask, 0);
      gl.uniform1f(u.drift, reduceMotion ? 0 : 1);
      return true;
    }

    let frame = 0;
    let awake = 0;
    let last = { left: 0, top: 0, width: 0, height: 0 };
    const started = performance.now();

    /**
     * Render below CSS resolution and let the browser scale it up.
     *
     * Everything this shader draws is low-frequency — broad folds, a soft
     * press, a wide pool of light — so half resolution is indistinguishable
     * from full once it is scaled back, and the bilinear upscale does the
     * anti-aliasing for free. It is well under half the fragments.
     *
     * Not lower than this: the dither below is one sample per *rendered* pixel,
     * so scaling down coarsens its grain as the upscale magnifies it.
     *
     * That matters more than it looks: a full-panel fragment shader at device
     * resolution is millions of pixels of noise per frame, and on a machine
     * without a GPU — a cheap laptop, or a headless browser — every one of them
     * is rasterised on the CPU.
     */
    const RENDER_SCALE = 0.65;
    const dpr = () => Math.min(window.devicePixelRatio || 1, 2) * RENDER_SCALE;

    function resize(rect: DOMRect) {
      if (!gl) return;
      const w = Math.max(1, Math.round(rect.width * dpr()));
      const h = Math.max(1, Math.round(rect.height * dpr()));
      if (el!.width === w && el!.height === h) return;
      el!.width = w;
      el!.height = h;
      gl.viewport(0, 0, w, h);
    }

    const request = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const wake = () => {
      // A `scroll` event fires once but the filmstrip keeps lerping for a few
      // hundred milliseconds after it. Without a grace window the loop can find
      // nothing moving on the very next frame, stop, and leave the light behind.
      awake = performance.now() + 700;
      request();
    };

    function tick() {
      frame = 0;
      const rect = box!.getBoundingClientRect();
      // Hidden, or not laid out yet. Nothing to track and nothing to draw.
      if (rect.width === 0 || rect.height === 0) return;
      const drawable = ensure();
      if (drawable) resize(rect);

      if (!seen.current) {
        pointer.current = { x: rect.left + rect.width * 0.62, y: rect.top + rect.height * 0.5 };
        light.current = { ...pointer.current };
      }

      const dx = pointer.current.x - light.current.x;
      const dy = pointer.current.y - light.current.y;
      const ease = reduceMotion ? 1 : 0.12;
      light.current.x += dx * ease;
      light.current.y += dy * ease;

      const lx = (light.current.x - rect.left) / rect.width;
      const ly = (light.current.y - rect.top) / rect.height;

      // Also published as custom properties. Nothing styles off them — they are
      // the one externally observable trace of where the light thinks it is,
      // which is what the end-to-end test asserts against.
      box!.style.setProperty("--mx", `${(lx * 100).toFixed(2)}%`);
      box!.style.setProperty("--my", `${(ly * 100).toFixed(2)}%`);

      if (drawable && gl && program && u) {
        gl.useProgram(program);
        gl.uniform2f(u.res, el!.width, el!.height);
        gl.uniform2f(u.light, lx, 1 - ly);
        gl.uniform1f(u.time, (performance.now() - started) / 1000);
        const rectUv = markRect(el!.width, el!.height);
        gl.uniform4f(u.rect, rectUv[0], rectUv[1], rectUv[2], rectUv[3]);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }

      const drifted =
        rect.left !== last.left ||
        rect.top !== last.top ||
        rect.width !== last.width ||
        rect.height !== last.height;
      last = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };

      // The cloth drifts slowly on its own, so this keeps running while visible
      // — but only while visible. `prefers-reduced-motion` kills the drift, and
      // then the loop settles like every other one on the site.
      /*
       * One reason to keep going: something is actually happening.
       *
       * `busy` means the light has not caught up, or the panel is still moving,
       * or an input landed inside the grace window — and it is deliberately not
       * gated on visibility, because a light left mid-flight would be wrong at
       * the exact moment the section comes on screen.
       *
       * There is no second, unconditional term. An earlier version kept
       * redrawing forever while the section was visible so the cloth could drift
       * on its own, which meant a full-panel fragment shader running at 60fps
       * for as long as the panel was in view — on a page that states elsewhere
       * that an idle page burns no frames, and on a laptop battery. The drift
       * still happens, because `uTime` advances whenever the loop runs: the
       * cloth breathes while you are moving through the section and settles when
       * you stop, which is when nobody is looking at it anyway.
       */
      const busy = drifted || performance.now() < awake || Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5;
      if (busy) request();
    }

    const onMove = (event: PointerEvent) => {
      pointer.current = { x: event.clientX, y: event.clientY };
      if (!seen.current) {
        seen.current = true;
        light.current = { ...pointer.current };
      }
      wake();
    };

    // Waking on appearance keeps the first frame after a scroll-in correct;
    // the loop then settles on its own.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) wake();
      },
      { threshold: 0 },
    );
    observer.observe(box);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", wake);
    wake();

    return () => {
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", wake);
      if (frame) cancelAnimationFrame(frame);
      if (gl) {
        if (texture) gl.deleteTexture(texture);
        if (quad) gl.deleteBuffer(quad);
        if (program) gl.deleteProgram(program);
      }
    };
  }, [reduceMotion]);

  return (
    <div ref={host} className={cn("absolute inset-0", className)} aria-hidden="true">
      <canvas ref={canvas} className="size-full" />
    </div>
  );
}

/**
 * How tall the mark stands, as a fraction of the panel, and where its centre
 * sits across it.
 *
 * Only the *height* is fixed. The width has to be derived from the panel's
 * aspect at draw time — see `markRect` — because UV is normalised per axis: a
 * rectangle that is 0.44 x 0.88 in UV is very nearly square on a 1440x695
 * panel, and mapping a 801x1453 portrait mark into it squashes the logo flat.
 * Hard-coding both numbers is what did exactly that.
 */
const MARK_HEIGHT = 0.74;
const MARK_CENTRE_X = 0.72;

/** The mark's own aspect, width over height. */
const MARK_ASPECT = 801.2 / 1453.0;

/**
 * The mark's rectangle in UV, for a panel of `w` x `h` device pixels.
 *
 * Undistorted by construction: the height is chosen, the width follows from the
 * mark's own aspect and the panel's, so the logo keeps its proportions at every
 * viewport shape. It shrinks on a wide panel rather than stretching to fill one.
 */
function markRect(w: number, h: number): [number, number, number, number] {
  const height = MARK_HEIGHT;
  const width = (height * h * MARK_ASPECT) / Math.max(w, 1);
  return [MARK_CENTRE_X - width / 2, (1 - height) / 2, width, height];
}

/** The mark's own bounding box inside `LOADER_VIEWBOX`, measured from the paths. */
const MARK_BBOX = { x: 637.7, y: 162.2, w: 801.2, h: 1453.0 };

/**
 * Rasterise the logomark once, blurred, as the shader's only texture.
 *
 * Blurring here rather than in the shader is the cheap way round: a Gaussian in
 * a fragment shader is a loop of taps on every pixel of every frame, whereas
 * `ctx.filter` does it once on the CPU at start-up, on a 256px image, and the
 * result is exactly the soft ramp the emboss needs.
 */
function markTexture(gl: WebGLRenderingContext): WebGLTexture | null {
  // 1024 rather than 512: the ramp this produces is differentiated in the
  // shader, so its own resolution shows up as steps in the surface normal.
  const H = 1024;
  const W = Math.round((H * MARK_BBOX.w) / MARK_BBOX.h);
  const pad = 0.12;

  const sharp = document.createElement("canvas");
  sharp.width = W;
  sharp.height = H;
  const sc = sharp.getContext("2d");
  if (!sc) return null;

  const scale = Math.min((W * (1 - pad * 2)) / MARK_BBOX.w, (H * (1 - pad * 2)) / MARK_BBOX.h);
  sc.translate(
    (W - MARK_BBOX.w * scale) / 2 - MARK_BBOX.x * scale,
    (H - MARK_BBOX.h * scale) / 2 - MARK_BBOX.y * scale,
  );
  sc.scale(scale, scale);
  sc.fillStyle = "#fff";
  for (const shape of LOADER_SHAPES) {
    sc.save();
    sc.translate(shape.x, shape.y);
    sc.fill(new Path2D(shape.d));
    sc.restore();
  }

  const soft = document.createElement("canvas");
  soft.width = W;
  soft.height = H;
  const bc = soft.getContext("2d");
  if (!bc) return null;
  bc.filter = `blur(${Math.round(W * 0.045)}px)`;
  bc.drawImage(sharp, 0, 0);

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, soft);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return texture;
}

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
precision highp float;

uniform vec2  uRes;
uniform float uTime;
uniform vec2  uLight;
uniform vec4  uMaskRect;
uniform float uDrift;
uniform sampler2D uMask;

varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y);
}

/*
 * Three octaves, and the gain kept low.
 *
 * Four octaves at full gain is the difference between satin and crumpled foil:
 * the top octave lands at a frequency where the finite-difference normal picks
 * up a hard gradient on every pixel, and the whole surface reads as camouflage.
 * Cloth is mostly one big fold with a little detail on it.
 */
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.62;
  for (int i = 0; i < 3; i++) {
    v += a * vnoise(p);
    p *= 2.03;
    a *= 0.38;
  }
  return v;
}

/* The mark, as a soft depression. Zero outside its rectangle. */
float press(vec2 uv) {
  vec2 m = (uv - uMaskRect.xy) / uMaskRect.zw;
  if (m.x < 0.0 || m.x > 1.0 || m.y < 0.0 || m.y > 1.0) return 0.0;
  // Fade at the very edge of the rect so a straight cut never shows.
  float edge = smoothstep(0.0, 0.04, m.x) * smoothstep(1.0, 0.96, m.x)
             * smoothstep(0.0, 0.04, m.y) * smoothstep(1.0, 0.96, m.y);
  return texture2D(uMask, m).a * edge;
}

/*
 * The surface. Drapery minus the mark: everything else in this shader is a
 * consequence of these two lines.
 */
float height(vec2 uv, float aspect) {
  vec2 q = vec2(uv.x * aspect, uv.y);
  /* Stretched horizontally, so folds hang rather than tile. */
  vec2 drift = vec2(uTime * 0.012, uTime * 0.005) * uDrift;
  float folds = fbm(q * vec2(1.05, 1.75) + drift) * 0.92;

  /*
   * A whisper of dither.
   *
   * The mark arrives as an 8-bit alpha ramp, and the normal is a *difference*
   * of it — so each quantisation step in that ramp becomes a visible contour
   * line running along the mark's edge, like a badly rendered gradient. A tiny
   * random offset, far below the threshold of visibility on its own, scatters
   * the steps into grain and the banding disappears.
   */
  float dither = (hash(uv * uRes) - 0.5) * 0.0011;

  return folds - press(uv) * 0.62 + dither;
}

void main() {
  float aspect = uRes.x / uRes.y;
  vec2 uv = vUv;
  /*
   * The finite-difference step, in **uv**, and deliberately not in pixels.
   *
   * It used to be 1.4 / uRes -- one-and-a-bit device pixels. That makes the
   * whole surface resolution-dependent: on a low-resolution render the
   * difference is taken across a wide slice of the mark's bevel and averages it
   * flat, and on a HiDPI one it samples the same bevel finely and comes out
   * sharp. The identical page rendered the logomark as a solid pressed shape on
   * one screen and a faint outline on another.
   *
   * A fixed uv step samples the same shape everywhere, whatever the device is
   * rasterising it at. EPS / aspect on x, so the step covers the same physical
   * distance on both axes rather than being stretched by the panel's shape.
   */
  const float EPS = 0.0016;
  vec2 e = vec2(EPS / aspect, EPS);

  float h  = height(uv, aspect);
  float hx = height(uv + vec2(e.x, 0.0), aspect);
  float hy = height(uv + vec2(0.0, e.y), aspect);

  /*
   * The normal, from the gradient per unit of aspect-corrected space, so the
   * same slope reads the same whatever the panel's shape. BUMP is the single
   * most sensitive number here: it swings the surface between flat paper and
   * hammered metal.
   */
  const float BUMP = 0.85;
  vec3 n = normalize(vec3(((h - hx) / EPS) * BUMP, ((h - hy) / EPS) * BUMP, 1.0));

  vec3 view = vec3(0.0, 0.0, 1.0);

  /* Key light: fixed, low, from the upper left. This is what shapes the folds. */
  vec3 key = normalize(vec3(-0.45, 0.62, 0.64));
  float kd = max(dot(n, key), 0.0);
  float ks = pow(max(dot(n, normalize(key + view)), 0.0), 28.0);

  /* The cursor light, in aspect-corrected space so its falloff is a circle. */
  vec2 p = vec2(uv.x * aspect, uv.y);
  vec2 lp = vec2(uLight.x * aspect, uLight.y);
  float dist = length(p - lp);
  vec3 ldir = normalize(vec3(lp - p, 0.42));
  float ld = max(dot(n, ldir), 0.0);
  float lspec = pow(max(dot(n, normalize(ldir + view)), 0.0), 46.0);
  /* Focused: a defined pool, not a wash across the panel. */
  float pool = smoothstep(0.24, 0.01, dist);

  vec3 paper = vec3(0.964, 0.960, 0.945);
  vec3 lime  = vec3(0.776, 1.000, 0.243);

  /* Narrow range on purpose: this is a pale fabric in flat light, not chrome. */
  vec3 col = paper * (0.90 + 0.15 * kd);
  col += vec3(1.0) * ks * 0.10;

  /* Lime arrives as light, so it takes the fold shading with it. */
  col = mix(col, col * mix(vec3(1.0), lime, 0.92), pool * (0.30 + 0.62 * ld));
  col += lime * lspec * pool * 0.55;

  gl_FragColor = vec4(col, 1.0);
}`;

/** Bind the one oversized triangle every frame draws. */
function setup(gl: WebGLRenderingContext, program: WebGLProgram): WebGLBuffer | null {
  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  // One oversized triangle rather than two: fewer vertices, and no seam down
  // the diagonal where the pair would meet.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  return quad;
}

/** The shader's uniforms, looked up once. */
interface Uniforms {
  res: WebGLUniformLocation | null;
  time: WebGLUniformLocation | null;
  light: WebGLUniformLocation | null;
  mask: WebGLUniformLocation | null;
  rect: WebGLUniformLocation | null;
  drift: WebGLUniformLocation | null;
}

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    // Never throw for an ornament. A driver that rejects this leaves the cell
    // as plain paper, which is a section that looks quiet rather than broken.
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function build(gl: WebGLRenderingContext): WebGLProgram | null {
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}
