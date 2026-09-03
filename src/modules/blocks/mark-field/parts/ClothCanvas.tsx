"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { LOADER_SHAPES } from "@/components/layout/loader-mark";
import { cn } from "@/lib/utils";

/**
 * Cloth with the logomark underneath it, and a blob of accent you drag around.
 *
 * ## Where this comes from
 *
 * oddcommon.com's homepage carries a panel of crumpled white fabric with their
 * wordmark pushed up from *beneath* it, and a saturated yellow blob that
 * follows the cursor — stretching into merged lobes while the pointer moves and
 * contracting to one circle when it stops. The owner asked for that, closely.
 *
 * They do it with a real-time PBR cloth: a WebGL2 renderer, a `.glb` mesh, and
 * an 784 KB normal map beside a roughness map and a noise map — about 2.7 MB of
 * media across the page, plus the engine. It looks extraordinary and it is not
 * lightweight; it only feels that way because it is smooth.
 *
 * The part worth copying is the *technique*, not the asset list. A height field
 * is a function: the drapery here is domain-warped value noise with a ridged
 * octave for the creases, the mark is its own silhouette raised into a plateau,
 * and the blob is a chain of capsules. No mesh, no texture download, no
 * library — which is the same rule `docs/adr/0003` sets for every
 * other visual on this site: reproduce the gesture from parameters we control,
 * never the file.
 *
 * That matters on this page specifically: `CLAUDE.md` §4.3 makes bundle weight a
 * business metric on a conversion funnel, and adding a 3D engine is a dependency
 * decision the owner has to make, not one a decorative section can make for
 * them.
 *
 * ## The three parts
 *
 * **The cloth.** `drape()` warps one noise field by another before sampling it.
 * That warp is the whole difference between "noise" and "fabric": unwarped
 * octaves blob, warped ones run and curve into creases that travel. A ridged
 * octave — `1 - |2n - 1|` — puts sharp valleys where fabric gathers.
 *
 * **The mark, from below.** It is *added*, not subtracted. A pressed mark and a
 * raised one are lit from opposite sides and read completely differently: this
 * has to look like an object lying under a sheet, so the blurred silhouette is
 * pushed through a `smoothstep` into a flat top with a soft shoulder, the folds
 * are damped across that top the way a sheet stretched over something flat goes
 * quiet, and a little fabric gathers at the shoulder where it drapes over.
 *
 * **The blob.** A chain of followers: the head eases toward the cursor and each
 * link eases toward the one in front, on a half-life rather than a per-frame
 * fraction so it settles in the same wall-clock time whatever the frame rate.
 * The shader unions a capsule per pair of links and cuts the result hard at
 * zero, so it is a tapered tube while the chain is strung out and exactly one
 * circle once it is not. It is a *tint*, not a light —
 * it takes the same diffuse and specular terms as the cloth, so the folds run
 * straight through it and it reads as painted onto the fabric rather than
 * floating over it.
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
   * The pointer in **viewport** coordinates; the chain in **panel** ones.
   *
   * Both halves matter and they pull in opposite directions. The pointer has to
   * be a screen position, because on the filmstrip the panel travels sideways
   * whenever the page scrolls and no `pointermove` fires under a still hand —
   * track it in element space and the blob rides along with the cloth instead of
   * staying under the cursor.
   *
   * The chain has to be panel-local for the same reason read the other way: the
   * trail is the links falling behind *the fabric*, so a panel sliding under a
   * motionless cursor has to stretch it exactly as a moving cursor does. `tick`
   * converts between the two once a frame.
   */
  const pointer = useRef({ x: 0, y: 0 });
  const trail = useRef(Array.from({ length: TRAIL }, () => ({ x: 0, y: 0 })));
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

    // Scratch for the trail uniform, allocated once rather than per frame.
    const packed = new Float32Array(TRAIL * 2);

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
        trail: gl.getUniformLocation(program, "uTrail[0]"),
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
    // Wall-clock reference for the chain's easing — see `tick`.
    let lastFrame = performance.now();
    let last = { left: 0, top: 0, width: 0, height: 0 };
    const started = performance.now();

    /**
     * Render at roughly one device pixel, and no less.
     *
     * This used to render at 0.65× and let the browser scale up, on the grounds
     * that everything the shader drew was low-frequency. That stopped being true
     * the moment the surface grew creases and the mark became a plateau with a
     * defined shoulder: at DPR 1 a 0.65 render is a 1.5× bilinear upscale, and
     * the whole panel arrived as a smudge — which is exactly what it looked
     * like. The floor of 1 keeps a non-retina screen honest; the 0.8 keeps a
     * retina one from rasterising four times the fragments for a surface that
     * has no detail at that scale.
     *
     * It still matters: a full-panel fragment shader is millions of pixels of
     * noise per frame, and on a machine without a GPU every one of them is
     * rasterised on the CPU.
     */
    const dpr = () => Math.max(1, Math.min(window.devicePixelRatio || 1, 2) * 0.8);

    function resize(rect: DOMRect) {
      if (!gl) return;
      /*
       * A ceiling on fragments, not just on scale.
       *
       * Scale alone says nothing about cost — the same 0.8 factor is a million
       * pixels on a laptop panel and four million on a retina ultrawide, and
       * this shader's per-pixel budget is large enough that the difference is
       * the difference between smooth and unusable. The budget is what actually
       * bounds the work, so it is what gets set; the scale drops below one
       * device pixel only when a panel is big enough to need it, which is the
       * one case where a little softness is the correct trade.
       */
      const want = dpr();
      const fragments = rect.width * rect.height * want * want;
      const scale = fragments > MAX_FRAGMENTS ? want * Math.sqrt(MAX_FRAGMENTS / fragments) : want;
      const w = Math.max(1, Math.round(rect.width * scale));
      const h = Math.max(1, Math.round(rect.height * scale));
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
      // nothing moving on the very next frame, stop, and leave the blob behind.
      awake = performance.now() + 700;
      request();
    };

    function tick() {
      frame = 0;
      const rect = box!.getBoundingClientRect();
      // Hidden, or not laid out yet. Nothing to track and nothing to draw.
      if (rect.width === 0 || rect.height === 0) return;

      /*
       * Track always, draw only when someone can see it.
       *
       * These are separate costs and they are separated on purpose. Tracking is
       * a dozen lerps and it has to keep running off screen, because the blob is
       * anchored in the viewport and a chain frozen mid-flight would be visibly
       * wrong at the moment the panel arrives. Drawing is a full-panel fragment
       * shader over a million pixels.
       *
       * On the filmstrip this panel is one of seven and off screen nearly all of
       * the time, while every scroll event wakes the loop — so without this gate
       * the most expensive surface on the site renders continuously while the
       * visitor reads something else. It was enough to starve a machine running
       * several browsers at once, which is how it was found.
       */
      const onScreen =
        rect.right > 0 &&
        rect.bottom > 0 &&
        rect.left < window.innerWidth &&
        rect.top < window.innerHeight;

      const drawable = onScreen && ensure();
      if (drawable) resize(rect);

      const links = trail.current;

      /*
       * The cursor, as a position on the *panel*.
       *
       * The pointer is tracked in viewport coordinates — it has to be, because
       * the blob marks a point on the screen and no event fires while the page
       * scrolls under a still hand. The chain, though, lives in panel space, and
       * that is the whole reason a trail appears when the filmstrip slides.
       *
       * Draw the chain in viewport space and this target is constant whenever
       * the hand is still: the panel travels, the blob travels with it, and the
       * shape stays a circle even though it is visibly moving across the cloth.
       * Converting here makes the panel's own motion a change in the target, so
       * the links fall behind it exactly as they do under a moving cursor. The
       * blob is painted *on the fabric*, and the fabric is what it lags against.
       */
      if (!seen.current) {
        pointer.current = { x: rect.left + rect.width * 0.62, y: rect.top + rect.height * 0.5 };
      }
      const cursor = {
        x: (pointer.current.x - rect.left) / rect.width,
        y: (pointer.current.y - rect.top) / rect.height,
      };
      if (!seen.current) for (const link of links) Object.assign(link, cursor);

      /*
       * The chain.
       *
       * The head eases toward the cursor and every link eases toward the one in
       * front of it. Strung out by a fast pointer — or by a panel sliding under a
       * still one — it is a row of overlapping circles the shader unions into one
       * lobed shape; left alone every link arrives at the same point and the
       * shape becomes a single circle. That collapse is the behaviour worth
       * having, and it is free: there is no separate "settle" animation to write
       * or to get wrong.
       *
       * Eased against the clock, not against the frame.
       *
       * A fixed fraction per frame makes the whole thing run at whatever speed
       * the machine happens to be drawing at: the same chain settles in 300ms at
       * sixty frames a second and in four seconds at five, so the blob visibly
       * drags on exactly the hardware least able to hide it. The half-life is
       * the thing that should be constant, so it is the thing that gets written
       * down, and the per-frame fraction is derived from however long the frame
       * actually took. `dt` is capped because a tab returning from the
       * background reports a gap of minutes, and an uncapped step would teleport
       * the chain instead of easing it.
       *
       * The head tracks tightly and the tail is what lags — in the reference the
       * pointer sits dead centre of the shape, and only the trail falls behind.
       */
      const now = performance.now();
      const dt = Math.min(now - lastFrame, 100);
      lastFrame = now;
      const decay = (halfLifeMs: number) => 1 - Math.pow(0.5, dt / halfLifeMs);
      const headEase = reduceMotion ? 1 : decay(22);
      const linkEase = reduceMotion ? 1 : decay(26);
      // Measured in pixels, so the sleep threshold below means the same thing on
      // every panel size — the links themselves are fractions of one.
      let moving = 0;
      let target: { x: number; y: number } = cursor;
      let ease = headEase;
      for (const link of links) {
        const dx = (target.x - link.x) * rect.width;
        const dy = (target.y - link.y) * rect.height;
        moving = Math.max(moving, Math.abs(dx), Math.abs(dy));
        link.x += (target.x - link.x) * ease;
        link.y += (target.y - link.y) * ease;
        // Every link but the first chases the one in front rather than the
        // cursor, which is what makes the chain a tail instead of a cluster.
        target = link;
        ease = linkEase;
      }

      const head = links[0] ?? cursor;
      const hx = head.x;
      const hy = head.y;

      // Also published as custom properties. Nothing styles off them — they are
      // the one externally observable trace of where the blob thinks it is,
      // which is what the end-to-end test asserts against.
      box!.style.setProperty("--mx", `${(hx * 100).toFixed(2)}%`);
      box!.style.setProperty("--my", `${(hy * 100).toFixed(2)}%`);

      if (drawable && gl && program && u) {
        gl.useProgram(program);
        gl.uniform2f(u.res, el!.width, el!.height);
        gl.uniform1f(u.time, (performance.now() - started) / 1000);
        links.forEach((link, i) => {
          packed[i * 2] = link.x;
          // Flipped, because uv runs up the screen and the panel runs down.
          packed[i * 2 + 1] = 1 - link.y;
        });
        gl.uniform2fv(u.trail, packed);
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

      /*
       * One reason to keep going: something is actually happening.
       *
       * `busy` means the chain has not settled, or the panel is still moving, or
       * an input landed inside the grace window — and it is deliberately not
       * gated on visibility, because a blob left mid-flight would be wrong at
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
      if (drifted || performance.now() < awake || moving > 0.4) request();
    }

    const onMove = (event: PointerEvent) => {
      pointer.current = { x: event.clientX, y: event.clientY };
      // No snapping here: the links are panel-local and this handler has no
      // rect to convert with. `tick` holds them on the resting position until
      // this flips, and eases from there — which is a nicer arrival anyway.
      seen.current = true;
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
 * The most fragments this surface may ever rasterise in one frame.
 *
 * Sized so a full-width panel on a laptop stays at one device pixel and nothing
 * changes, while a retina ultrawide gives up a little sharpness rather than a
 * lot of frame rate. Raising it is not free in a way a screenshot will show —
 * it is paid on the machines least able to afford it.
 */
const MAX_FRAGMENTS = 1.8e6;

/**
 * Links in the follower chain.
 *
 * Long enough that a fast sweep leaves a real tail, short enough that the
 * shader's union loop stays cheap — it runs per pixel, so this number is a
 * per-frame cost multiplied by every fragment on the panel.
 */
const TRAIL = 14;

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
 * `ctx.filter` does it once on the CPU at start-up, on a 1024px image, and the
 * result is the ramp the shader needs.
 *
 * The blur is *tight*. It used to be 4.5% of the width, which is the right
 * amount for a soft press and far too much for a raised object: the shader
 * pushes this ramp through a `smoothstep` to get a flat top with a defined
 * shoulder, so a wide ramp gives a vague mound rather than something lying
 * under a sheet. What is wanted here is the width of the fold the fabric makes
 * as it drapes over an edge, and that is narrow.
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
  bc.filter = `blur(${Math.round(W * 0.026)}px)`;
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

#define TRAIL ${TRAIL}

uniform vec2  uRes;
uniform float uTime;
uniform vec4  uMaskRect;
uniform float uDrift;
uniform vec2  uTrail[TRAIL];
uniform sampler2D uMask;

varying vec2 vUv;

/*
 * A hash with no transcendental in it.
 *
 * The usual fract(sin(dot(...))) costs a sin per corner, four corners per noise
 * sample, and this shader takes dozens of noise samples per pixel across three
 * height taps. That was affordable while the surface was three flat octaves at
 * two-thirds resolution; at full resolution with drapery it is not — and it does
 * not fail as a slow shader, it fails as a page that stops responding, because
 * a software rasteriser runs every one of those sines on the CPU. This is
 * arithmetic only, and indistinguishable in the output.
 */
float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
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

/* Two octaves, for the fields that only ever contribute a shoulder. */
float fbm2(vec2 p) {
  return 0.62 * vnoise(p) + 0.236 * vnoise(p * 2.03);
}

vec2 turn(vec2 p, float a) {
  float c = cos(a), s = sin(a);
  return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
}

/*
 * The drapery.
 *
 * Two things make this fabric rather than weather, and the first version of it
 * got both wrong and came out as clouds.
 *
 * **Anisotropy.** A fold is long. Sampling noise that has been stretched hard
 * along one axis gives ridges that run; sampling it round gives lumps, and a
 * field of lumps is a cloud however it is lit. Two stretched fields at
 * different angles cross into crumple that still has direction in it.
 *
 * **A warp you can barely see.** Displacing the sample position by another
 * noise field is what stops the folds looking ruled — but at any real strength
 * it swirls them, and swirl is exactly the cloud. It wants to be a nudge.
 *
 * The last term is ridged: folding the field about its midpoint puts a sharp
 * valley wherever the smooth version crossed a half. Ridged on a *stretched*
 * field, so the sharp part is a crease and not a dent.
 */
float drape(vec2 q) {
  vec2 warp = vec2(vnoise(q * 0.5), vnoise(q * 0.5 + 3.1)) - 0.5;
  q += warp * 0.32;

  vec2 a = turn(q, 0.42);
  vec2 b = turn(q, -1.05);

  float broad  = fbm(vec2(a.x * 0.72, a.y * 2.85));
  float across = vnoise(vec2(b.x * 1.15, b.y * 2.15)) * 0.86;
  float crease = 1.0 - abs(fbm2(vec2(a.x * 1.55, a.y * 5.1)) * 2.2 - 1.0);

  /*
   * Where the creases are allowed to gather.
   *
   * At a constant weight the ridges cover the panel evenly and it reads as
   * corrugation — rippled satin, not cloth. Real fabric is mostly calm with the
   * crumple concentrated in a few places, so a low-frequency field decides where
   * the sharp term gets to speak. It reuses the warp rather than sampling again:
   * the warp is already the lowest-frequency thing here, and one more lookup in
   * this function is three more per pixel.
   */
  float busy = clamp(warp.x + warp.y + 0.5, 0.0, 1.0);

  return broad * 0.34 + across * 0.21 + crease * mix(0.03, 0.20, busy);
}

/* The mark's silhouette, 0 to 1, blurred. Zero outside its rectangle. */
float silhouette(vec2 uv) {
  vec2 m = (uv - uMaskRect.xy) / uMaskRect.zw;
  if (m.x < 0.0 || m.x > 1.0 || m.y < 0.0 || m.y > 1.0) return 0.0;
  // Fade at the very edge of the rect so a straight cut never shows.
  float edge = smoothstep(0.0, 0.04, m.x) * smoothstep(1.0, 0.96, m.x)
             * smoothstep(0.0, 0.04, m.y) * smoothstep(1.0, 0.96, m.y);
  return texture2D(uMask, m).a * edge;
}

/*
 * The surface: drapery, plus the mark pushing up from underneath.
 *
 * plateau is the blurred silhouette squared off into a flat top with a soft
 * shoulder — an object, not a mound. Three things follow from it:
 *
 *   - the mark is *added*. Raised and pressed are lit from opposite sides, and
 *     the brief is something lying under a sheet;
 *   - the folds are damped across the top, because a sheet stretched over
 *     something flat goes quiet there and keeps its wrinkles in the slack
 *     around it;
 *   - a little fabric gathers at the shoulder. plateau * (1 - plateau) peaks
 *     exactly on the edge and is zero on both the top and the floor, which is
 *     where the bunching goes.
 */
float height(vec2 uv, float aspect) {
  vec2 q = vec2(uv.x * aspect, uv.y);
  /* Stretched horizontally, so folds hang rather than tile. */
  vec2 drift = vec2(uTime * 0.012, uTime * 0.005) * uDrift;
  float folds = drape(q * 0.95 + drift);

  float mark = silhouette(uv);
  float plateau = smoothstep(0.30, 0.72, mark);
  float gather = plateau * (1.0 - plateau);

  /*
   * A whisper of dither.
   *
   * The mark arrives as an 8-bit alpha ramp, and the normal is a *difference*
   * of it — so each quantisation step in that ramp becomes a visible contour
   * line running along the shoulder, like a badly rendered gradient. A tiny
   * random offset, far below the threshold of visibility on its own, scatters
   * the steps into grain and the banding disappears.
   *
   * Tiny is the operative word, and it is easy to get wrong by an order of
   * magnitude: the normal divides this by EPS, so an offset of 0.0011 across a
   * 0.0016 step is a slope of 0.7 on every pixel — louder than the cloth it is
   * supposed to be hiding inside, and the panel comes out sprayed with grit.
   * One 8-bit step of the plateau's own amplitude is the size that works.
   */
  float dither = (hash(uv * uRes) - 0.5) * 0.00022;

  return folds * mix(1.0, 0.22, plateau) + plateau * 0.95 + gather * 0.07 + dither;
}

/*
 * Distance to a line segment.
 *
 * The union below is built from *segments between consecutive links* rather
 * than from a circle per link, and that choice is load-bearing. The obvious
 * version — a circle at every link, smooth-minimum'd together — accumulates:
 * smin pulls its result below both inputs, so each of the fourteen steps
 * subtracts again, and a chain sitting perfectly still rendered as a swollen,
 * lobed shape instead of the one clean circle it should be. Capsules need only
 * a plain min, which has no such bias: collapse the chain to a point and every
 * segment degenerates to the same circle, so the union is exactly that circle.
 * They also join without a cusp, which is what smin was wanted for.
 */
float sdSegment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-9), 0.0, 1.0);
  return length(pa - ba * h);
}

void main() {
  float aspect = uRes.x / uRes.y;
  vec2 uv = vUv;
  /*
   * The finite-difference step, in **uv**, and deliberately not in pixels.
   *
   * It used to be 1.4 / uRes -- one-and-a-bit device pixels. That makes the
   * whole surface resolution-dependent: on a low-resolution render the
   * difference is taken across a wide slice of the shoulder and averages it
   * flat, and on a HiDPI one it samples the same shoulder finely and comes out
   * sharp. The identical page rendered the logomark as a solid shape on one
   * screen and a faint outline on another.
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
  const float BUMP = 1.35;
  vec3 n = normalize(vec3(((h - hx) / EPS) * BUMP, ((h - hy) / EPS) * BUMP, 1.0));

  vec3 view = vec3(0.0, 0.0, 1.0);

  /* One fixed key light, low and from the upper left. This shapes everything. */
  vec3 key = normalize(vec3(-0.42, 0.66, 0.62));
  float kd = max(dot(n, key), 0.0);
  float ks = pow(max(dot(n, normalize(key + view)), 0.0), 34.0);
  /* Valleys sit in their own shade. Cheap ambient occlusion, from the height. */
  float sink = smoothstep(-0.05, 0.55, h);

  /*
   * The blob: the chain, smooth-unioned and cut hard at zero.
   *
   * Everything is in aspect-corrected space, so the shape stays round on any
   * panel. Each segment is fatter than the one behind it, which is what tapers
   * the tail, and consecutive capsules overlap so the silhouette is continuous
   * — a tube while the chain is strung out, a single circle once it is not.
   */
  vec2 p = vec2(uv.x * aspect, uv.y);
  float field = 1e6;
  for (int i = 0; i < TRAIL - 1; i++) {
    vec2 a = vec2(uTrail[i].x * aspect, uTrail[i].y);
    vec2 b = vec2(uTrail[i + 1].x * aspect, uTrail[i + 1].y);
    float r = 0.175 * (1.0 - 0.55 * float(i) / float(TRAIL - 1));
    field = min(field, sdSegment(p, a, b) - r);
  }
  /* Barely any feather: the reference's edge is a cut, not a glow. */
  float blob = smoothstep(0.0035, -0.0035, field);

  vec3 paper = vec3(0.964, 0.960, 0.945);
  vec3 lime  = vec3(0.776, 1.000, 0.243);

  vec3 cloth = paper * (0.845 + 0.21 * kd) * (0.95 + 0.05 * sink);
  cloth += vec3(1.0) * ks * 0.12;

  /*
   * The blob is a tint, not a light.
   *
   * It takes the same diffuse and specular terms the cloth does, so every fold
   * runs straight through it and the accent looks painted onto the fabric. A
   * flat fill here — the obvious version — reads as a shape floating above the
   * panel, which is the one thing the whole surface exists to avoid.
   */
  vec3 paint = lime * (0.76 + 0.28 * kd) * (0.94 + 0.06 * sink);
  paint += vec3(1.0) * ks * 0.18;

  gl_FragColor = vec4(mix(cloth, paint, blob), 1.0);
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
  trail: WebGLUniformLocation | null;
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
