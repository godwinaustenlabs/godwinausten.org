#!/usr/bin/env node
/**
 * Generates the drawn assets that are neither tiles nor photographs.
 *
 * Two families, both line-work, both generated for the same reason as
 * everything in `generate-tile-stills.mjs` — see
 * docs/adr/0003-no-third-party-imagery-shipped.md.
 *
 * ## 1. Service schematics — `diagrams/{mapping,swarm,integration}.svg`
 *
 * These sit at the head of the three "How it gets built" cells on the home
 * page, above the claim. Each is a literal diagram of the offering under it: a
 * traced process with the expensive step ringed, three agent clusters handing
 * off, a hub wired into four systems. Not texture — a second way to read the
 * same sentence.
 *
 * ## 2. Stage backdrops — `diagrams/{build,tune}.svg`
 *
 * These sit behind `Build` and `Tune` in the `/about` pillars, where
 * `wire-tangle.jpg` sits behind `Map`.
 *
 * The photograph works there because at 14% on paper it stops being a
 * photograph and reads as **pale line-work** — a scribble of tangled wire. The
 * two that were beside it did not: `fibre.jpg` is a teal starburst and
 * `trails.jpg` a pastel rainbow, and at any opacity they are colour fields in a
 * paper/ink/lime palette. These replace them with drawings that carry the same
 * hand as the tangle, and tell the stage's story in one motif:
 *
 *     Map → a tangle          the work as found
 *     Build → a lattice       the same mess, resolved into structure
 *     Tune → a settled signal candidates trimmed to one, and measured
 *
 * **Each backdrop is drawn for one ground.** A single mid-tone survives both
 * the paper and the ink tile only at full strength; behind the pillars they run
 * at 14% and 25%, where one tone cannot. `build` is light because its tile is
 * ink; `tune` is dark because its tile is paper. They are bespoke to their slot
 * and there is no reason to swap them.
 *
 *   npm run gen:diagrams
 *
 * Output: public/assets/diagrams/*.svg
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = resolve(ROOT, "public/assets/diagrams");

/** Schematic canvas. Cropped per diagram — see `svg()`. */
const W = 800;
const H = 800;

/** Backdrop canvas. Wide, and drawn edge to edge: the tile crops it like a photo. */
const BW = 1400;
const BH = 700;

/**
 * The schematics' tone.
 *
 * Much darker than the stills' `#9e9b8f`, and darker than `--color-soft`, but
 * short of ink. These are meant to be *read* — a second way to understand the
 * claim beside them — where a tile is texture behind a video that does not
 * exist yet. At the stills' weight they were present but not legible, which is
 * the worst of both. Ink itself would put them level with the headline and make
 * the cell a competition; this sits just under the body copy.
 */
const LINE = "#46443e";
/** For the ink tile: paper, dimmed by the tile's own 25%. */
const ON_INK = "#e8e6de";
/** For a paper tile: ink, dimmed by the tile's own 14%. */
const ON_PAPER = "#2a2a26";

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (n) => Math.round(n * 10) / 10;

function node(x, y, r) {
  return `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}"/>`;
}

function line(x1, y1, x2, y2) {
  return `M${r1(x1)} ${r1(y1)}L${r1(x2)} ${r1(y2)}`;
}

function box(x, y, w, h) {
  return `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" rx="3"/>`;
}

/**
 * Stroke widths are in **viewBox units**, and these drawings render at roughly
 * half scale inside their cell — an 800-unit box painted into about 400px. A
 * 1.5-unit line is therefore a 0.75px line on screen, which is why weights that
 * look right in isolation vanish in place. Everything below is sized for the
 * rendered result, not for the file.
 */

/**
 * `viewBox` is passed per drawing rather than defaulted to the canvas, because
 * these are painted with `background-size: contain` into a box whose shape they
 * do not control. `contain` fits the *whole viewBox*, so blank margin baked into
 * it is margin the browser faithfully reproduces — a wide drawing in a square
 * box renders at a third of the width it could have.
 */
function svg(label, body, viewBox = `0 0 ${W} ${H}`) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="none" role="presentation">
<!-- Godwin Austen Labs — "${label}". Generated: npm run gen:diagrams -->
${body}
</svg>
`;
}

/* ------------------------------------------------------------------ *
 * 1. Service schematics
 * ------------------------------------------------------------------ */

/*
 * 01 — Workflow Mapping. A process traced end to end: a spine of steps, two
 * that branch off and rejoin, and one ringed because it is the one actually
 * costing the money. The ring is the argument of the paragraph beside it.
 */
function mapping() {
  const random = rng(0x51a3);
  const y = H * 0.52;
  const x0 = W * 0.07;
  const x1 = W * 0.93;
  const steps = 7;
  const gap = (x1 - x0) / (steps - 1);
  const at = (i) => x0 + i * gap;

  const spine = [];
  for (let i = 0; i < steps - 1; i += 1) spine.push(line(at(i) + 12, y, at(i + 1) - 12, y));

  // Real work is never the straight line the org chart draws. One detour drops,
  // one lifts, at different depths so the pair does not read as a wave.
  const branches = [];
  const marks = [];
  const dips = [
    [1, 2, H * 0.22],
    [4, 5, -H * 0.18],
  ];
  for (const [from, to, dy] of dips) {
    const ax = at(from);
    const bx = at(to);
    const mx = (ax + bx) / 2;
    const my = y + dy;
    branches.push(
      `M${r1(ax)} ${r1(y)}C${r1(ax)} ${r1(my)} ${r1(ax + gap * 0.22)} ${r1(my)} ${r1(mx - gap * 0.16)} ${r1(my)}` +
        `L${r1(mx + gap * 0.16)} ${r1(my)}` +
        `C${r1(bx - gap * 0.22)} ${r1(my)} ${r1(bx)} ${r1(my)} ${r1(bx)} ${r1(y)}`,
    );
    marks.push(node(mx, my, 6.5));
  }

  const nodes = [];
  for (let i = 0; i < steps; i += 1) nodes.push(node(at(i), y, 8.5));

  // The measured one, sitting between the two detours so neither return
  // collides with its ring.
  const focus = at(3);
  const ticks = [];
  for (let i = 0; i < 30; i += 1) {
    const t = (i / 30) * Math.PI * 2;
    const l = 14 + random() * 12;
    ticks.push(
      line(
        focus + Math.cos(t) * 50,
        y + Math.sin(t) * 50,
        focus + Math.cos(t) * (50 + l),
        y + Math.sin(t) * (50 + l),
      ),
    );
  }

  // The week spent watching, before a line is written.
  const bx0 = at(0) - 24;
  const bx1 = at(2) + 24;
  const by = y - H * 0.34;
  const bracket = `M${r1(bx0)} ${r1(by + 22)}L${r1(bx0)} ${r1(by)}L${r1(bx1)} ${r1(by)}L${r1(bx1)} ${r1(by + 22)}`;

  return svg(
    "schematic: workflow mapping",
    `<g stroke="${LINE}" fill="none">
  <path d="${bracket}" stroke-width="3" opacity="0.55"/>
  <path d="${spine.join("")}" stroke-width="4.2" opacity="0.95"/>
  <path d="${branches.join("")}" stroke-width="3.2" opacity="0.7" stroke-dasharray="12 10"/>
  <path d="${ticks.join("")}" stroke-width="3.6" opacity="0.85" stroke-linecap="butt"/>
  <circle cx="${r1(focus)}" cy="${r1(y)}" r="38" stroke-width="3.4" opacity="0.8"/>
  <g fill="${LINE}" stroke="none" opacity="1">${nodes.join("")}</g>
  <g fill="none" stroke-width="3.2" opacity="0.8">${marks.join("")}</g>
</g>`,
    `0 ${r1(by - 24)} ${W} ${r1(y + H * 0.22 + 46 - (by - 24))}`,
  );
}

/*
 * 02 — Agent Swarms. Three tight clusters with thin traffic between them. The
 * density is *inside* each cluster: that is what "narrow agents that hand off"
 * looks like, and the opposite of one model doing everything.
 */
function swarm() {
  const random = rng(0x2f77);
  const centres = [
    [W * 0.24, H * 0.24],
    [W * 0.79, H * 0.4],
    [W * 0.42, H * 0.8],
  ];

  const links = [];
  const dots = [];
  const hubs = [];

  for (const [cx, cy] of centres) {
    const count = 7 + Math.floor(random() * 3);
    const spread = 82 + random() * 30;
    for (let i = 0; i < count; i += 1) {
      const t = (i / count) * Math.PI * 2 + random() * 0.5;
      const rad = spread * (0.6 + random() * 0.55);
      const x = cx + Math.cos(t) * rad;
      const y = cy + Math.sin(t) * rad * 0.9;
      links.push(line(cx, cy, x, y));
      dots.push(node(x, y, 5));
    }
    hubs.push(node(cx, cy, 9.5));
  }

  // Bowed, so the handoffs read as traffic rather than structure.
  const arcs = [];
  for (let i = 0; i < centres.length; i += 1) {
    const [ax, ay] = centres[i];
    const [bx, by] = centres[(i + 1) % centres.length];
    const mx = (ax + bx) / 2 + (by - ay) * 0.18;
    const my = (ay + by) / 2 - (bx - ax) * 0.18;
    arcs.push(`M${r1(ax)} ${r1(ay)}Q${r1(mx)} ${r1(my)} ${r1(bx)} ${r1(by)}`);
  }

  return svg(
    "schematic: agent swarms",
    `<g stroke="${LINE}" fill="none">
  <path d="${arcs.join("")}" stroke-width="3.4" opacity="0.7"/>
  <path d="${links.join("")}" stroke-width="2.2" opacity="0.55"/>
  <g fill="${LINE}" stroke="none" opacity="0.85">${dots.join("")}</g>
  <g fill="${LINE}" stroke="none" opacity="1">${hubs.join("")}</g>
</g>`,
  );
}

/*
 * 03 — Systems Integration. One hub, four boxes, wired. The boxes carry no
 * product names: naming the CRM would date the drawing and imply an integration
 * we have not built.
 */
function integration() {
  const random = rng(0x6b12);
  const cx = W * 0.5;
  const cy = H * 0.5;

  const bw = 168;
  const bh = 74;
  const hubR = 46;
  const spots = [
    [W * 0.04, H * 0.1],
    [W * 0.96 - bw, H * 0.16],
    [W * 0.04, H * 0.74],
    [W * 0.96 - bw, H * 0.68],
  ];

  const boxes = [];
  const runs = [];
  const joints = [];

  for (const [bx, by] of spots) {
    boxes.push(box(bx, by, bw, bh));
    // Arrive on the hub's rim at the angle the box actually sits, so four runs
    // meet the circle at four points instead of stacking onto one centreline.
    const px = bx + bw / 2 < cx ? bx + bw : bx;
    const py = by + bh / 2;
    const a = Math.atan2(cy - py, cx - px);
    const hx = cx - Math.cos(a) * hubR;
    const hy = cy - Math.sin(a) * hubR;
    runs.push(line(px, py, hx, hy));

    const t = 0.52 + random() * 0.12;
    const jx = px + (hx - px) * t;
    const jy = py + (hy - py) * t;
    const s = 9 + random() * 5;
    joints.push(
      `<rect x="${r1(jx - s / 2)}" y="${r1(jy - s / 2)}" width="${r1(s)}" height="${r1(s)}" ` +
        `transform="rotate(${r1((a * 180) / Math.PI)} ${r1(jx)} ${r1(jy)})"/>`,
    );
  }

  const ticks = [];
  for (let i = 0; i < 44; i += 1) {
    const t = (i / 44) * Math.PI * 2;
    const l = 12 + random() * 10;
    ticks.push(
      line(
        cx + Math.cos(t) * (hubR + 8),
        cy + Math.sin(t) * (hubR + 8),
        cx + Math.cos(t) * (hubR + 8 + l),
        cy + Math.sin(t) * (hubR + 8 + l),
      ),
    );
  }

  return svg(
    "schematic: systems integration",
    `<g stroke="${LINE}" fill="none">
  <path d="${runs.join("")}" stroke-width="3.2" opacity="0.8"/>
  <g stroke-width="3.6" opacity="0.9">${boxes.join("")}</g>
  <path d="${ticks.join("")}" stroke-width="3.4" opacity="0.8" stroke-linecap="butt"/>
  <circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(hubR)}" stroke-width="3.8" opacity="0.95"/>
  <g fill="${LINE}" stroke="none" opacity="1">${joints.join("")}${node(cx, cy, 11)}</g>
</g>`,
    `0 ${r1(H * 0.1 - 26)} ${W} ${r1(H * 0.74 + bh + 26 - (H * 0.1 - 26))}`,
  );
}

/* ------------------------------------------------------------------ *
 * 2. Stage backdrops
 * ------------------------------------------------------------------ */

/*
 * Build — the tangle resolved.
 *
 * A scaffold: a field of nodes on a loose grid, wired with straight members and
 * diagonal bracing. Deliberately the *same line weight* as the wire-tangle
 * photograph beside it, and deliberately orthogonal where that one is chaotic —
 * the two tiles are one sentence about what the middle week does.
 *
 * Drawn edge to edge. The tile paints it `bg-cover`, so anything inset would be
 * cropped to a floating fragment.
 */
function build() {
  const random = rng(0x8d21);
  const cols = 22;
  const rows = 12;
  const gx = BW / (cols - 1);
  const gy = BH / (rows - 1);

  // Jitter, so it reads as built rather than printed — but far less than the
  // tangle's, because the point is that this one resolved.
  const pt = [];
  for (let r = 0; r < rows; r += 1) {
    pt[r] = [];
    for (let c = 0; c < cols; c += 1) {
      pt[r][c] = [c * gx + (random() - 0.5) * gx * 0.3, r * gy + (random() - 0.5) * gy * 0.3];
    }
  }

  const members = [];
  const braces = [];
  const dots = [];

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const [x, y] = pt[r][c];
      if (c < cols - 1) members.push(line(x, y, ...pt[r][c + 1]));
      if (r < rows - 1) members.push(line(x, y, ...pt[r + 1][c]));
      // Bracing on roughly half the bays. A frame is only rigid where it is
      // triangulated, and an evenly braced grid reads as wallpaper.
      if (r < rows - 1 && c < cols - 1 && random() > 0.45) {
        braces.push(
          random() > 0.5 ? line(x, y, ...pt[r + 1][c + 1]) : line(...pt[r][c + 1], ...pt[r + 1][c]),
        );
      }
      if (random() > 0.66) dots.push(node(x, y, 2.8));
    }
  }

  // Drawn at near-full strength on purpose: the tile passes only 25% of it.
  return svg(
    "backdrop: build",
    `<g stroke="${ON_INK}" fill="none">
  <path d="${members.join("")}" stroke-width="1.2" opacity="0.95"/>
  <path d="${braces.join("")}" stroke-width="0.9" opacity="0.55"/>
  <g fill="${ON_INK}" stroke="none" opacity="0.9">${dots.join("")}</g>
</g>`,
    `0 0 ${BW} ${BH}`,
  );
}

/*
 * Tune — many passes converging on one.
 *
 * A wide bundle of candidate curves at the left, narrowing rightward until it
 * is a single settled line, over a calibration rule. The month after launch is
 * not more building: it is choosing between behaviours you already have and
 * proving the choice. A bundle collapsing to a line is that, and it is dense
 * enough to survive being cropped to a band by `bg-cover`.
 */
function tune() {
  const random = rng(0x3ac8);
  const mid = BH * 0.46;
  // Twelve, not twenty. Behind a word, this is texture — and twenty overlapping
  // passes stopped reading as "many settling on one" and started reading as a
  // smear across the tile.
  const PASSES = 12;

  /** One candidate: wobbles wide on the left, converges to `mid` on the right. */
  function pass(seedAmp, freq, phase) {
    const pts = [];
    for (let x = 0; x <= BW; x += 22) {
      const t = x / BW;
      // Convergence: full spread at t=0, nothing left by t=1.
      const envelope = Math.pow(1 - t, 1.7);
      const y = mid + Math.sin(t * Math.PI * 2 * freq + phase) * seedAmp * envelope;
      pts.push(`${x === 0 ? "M" : "L"}${x} ${Math.round(y)}`);
    }
    return pts.join("");
  }

  const ghosts = [];
  for (let i = 0; i < PASSES; i += 1) {
    const amp = BH * (0.08 + random() * 0.42);
    ghosts.push(pass(amp, 1.2 + random() * 3.4, random() * Math.PI * 2));
  }
  const settled = `M0 ${r1(mid)}L${BW} ${r1(mid)}`;

  // The rule it was measured against, and the points you actually check.
  const ticks = [];
  const baseline = BH * 0.93;
  for (let i = 0; i <= 72; i += 1) {
    const x = (BW / 72) * i;
    ticks.push(line(x, baseline, x, baseline - (i % 6 === 0 ? 18 : 9)));
  }
  const crossings = [];
  for (let i = 1; i < 6; i += 1) crossings.push(node((BW / 6) * i, mid, 3.8));

  return svg(
    "backdrop: tune",
    `<g stroke="${ON_PAPER}" fill="none">
  <path d="${ghosts.join("")}" stroke-width="1.05" opacity="0.5"/>
  <path d="${settled}" stroke-width="1.9" opacity="0.95"/>
  <path d="${line(0, baseline, BW, baseline)}" stroke-width="1.1" opacity="0.7"/>
  <path d="${ticks.join("")}" stroke-width="1.05" opacity="0.65" stroke-linecap="butt"/>
  <g fill="${ON_PAPER}" stroke="none" opacity="0.9">${crossings.join("")}</g>
</g>`,
    `0 0 ${BW} ${BH}`,
  );
}

const FILES = [
  ["mapping", mapping],
  ["swarm", swarm],
  ["integration", integration],
  ["build", build],
  ["tune", tune],
];

await mkdir(OUT_DIR, { recursive: true });

for (const [name, draw] of FILES) {
  const out = draw();
  await writeFile(resolve(OUT_DIR, `${name}.svg`), out, "utf8");
  console.log(`${name}.svg — ${(out.length / 1024).toFixed(1)} KB`);
}
