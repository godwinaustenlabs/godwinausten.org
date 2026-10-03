#!/usr/bin/env node
/**
 * Generates the drawn assets that are neither tiles nor photographs.
 *
 * Two families, both line-work, both generated for the same reason as
 * everything in `generate-tile-stills.mjs` — see
 * docs/adr/0003-no-third-party-imagery-shipped.md.
 *
 * ## 1. Service schematics — `diagrams/{mapping,swarm,integration,micro,pipeline}.svg`
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

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = resolve(ROOT, "public/assets/diagrams");
/** Where the four third-party marks are read from. See `loadMarks`. */
const LOGO_DIR = resolve(ROOT, "scripts/logos");

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
const LINE = "#3b3a34";
/** For the ink tile: paper, dimmed by the tile's own 25%. */
const ON_INK = "#e8e6de";
/** For a paper tile: ink, dimmed by the tile's own 14%. */
const ON_PAPER = "#2a2a26";

/*
 * The schematics' tones.
 *
 * `LINE` above still draws every *structure* — a box is a box and a spine is a
 * spine — and a tone is spent only on what the drawing is arguing about: where
 * work travels, where it waits, where it is refused, and which part of the
 * thing is live.
 *
 *   FLOW   the path work takes, and every hand-off
 *   DATA   records, and the systems that hold them
 *   HELD   work queued at a mouth, and the share a stage kept
 *   DROP   work refused — the reject path nobody draws
 *   CORE   the running core: brass, and the only bright mark in the set
 *
 * **These are metals, not colours, and that is the whole rule.** The first pass
 * at this used a saturated amber / blue / rust / green and it read as poster
 * paint on a paper-and-ink page — four primaries is a children's book, whatever
 * the drawing under them says. Variety here comes from *value and temperature*
 * instead: steel and pewter cool, sand and copper warm, across a real range of
 * weight, with brass held back for the one live mark in each drawing. Nothing
 * is above about 40% saturation, so the set reads as machined material and the
 * page stays paper and ink.
 *
 * Two of the drawings use the set as an **index** rather than as a meaning —
 * swarm's three clusters and integration's four plates — because there the
 * whole claim is that the things are not the same one, and there is no role to
 * name. Each says so at its own top. Everywhere else the legend above holds.
 *
 * **No signal lime in here.** The brief allows one lime bar per cell and each
 * of these cells already spends it on the rule above the claim; a second mark
 * in the drawing beside it breaks that rule and buys nothing. `CORE` is the
 * brightest thing in a drawing precisely because it is the only one.
 */
const FLOW = "#546a75"; // steel blue — the path work takes
const DATA = "#5f5d55"; // deep pewter — records, and what holds them
const HELD = "#8a7647"; // bronze — work queued, and a quantity kept
const DROP = "#7e5042"; // oxidised copper — work refused
const CORE = "#b08d52"; // brass, always inside a `LINE` edge — the running core
/** Paper, for knocking a hole in line-work: a port, and the edge under a fill. */
const PAPER = "#f6f5f1";

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

  /*
   * One hue per cluster.
   *
   * The claim beside this drawing is that these are *narrow* agents — three of
   * them, doing three different jobs, handing off. In a single tone that is
   * three identical smudges, and the only word it says is "network". Coloured
   * per cluster it says there are three and they are not the same one.
   */
  const HUES = [FLOW, DATA, HELD];

  const links = HUES.map(() => []);
  const rings = HUES.map(() => []);
  const dots = HUES.map(() => []);
  const hubs = [];

  const satellites = [];
  for (const [ci, [cx, cy]] of centres.entries()) {
    const count = 9 + Math.floor(random() * 3);
    const spread = 82 + random() * 30;
    const ring = [];
    for (let i = 0; i < count; i += 1) {
      const t = (i / count) * Math.PI * 2 + random() * 0.5;
      const rad = spread * (0.6 + random() * 0.55);
      const x = cx + Math.cos(t) * rad;
      const y = cy + Math.sin(t) * rad * 0.9;
      links[ci].push(line(cx, cy, x, y));
      dots[ci].push(node(x, y, 5));
      ring.push([x, y]);
    }
    satellites.push(ring);

    // The hub is the cluster's live core: brass, ringed in the cluster's own
    // tone. The ring is not an outline, it is what gives a light metal an
    // edge to sit against — see `CORE`.
    hubs.push(
      `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="10" fill="${CORE}" stroke="${HUES[ci]}" stroke-width="3.6"/>`,
    );
  }

  // Bowed, so the handoffs read as traffic rather than structure. Two arcs per
  // pair, bowed opposite ways: a single line between two hubs is a diagram of a
  // wire, and a pair is a diagram of a conversation.
  //
  // These are the one thing in the drawing that belongs to no cluster, so they
  // take `FLOW` — the same hue that carries work in the other three drawings.
  const arcs = [];
  for (let i = 0; i < centres.length; i += 1) {
    const [ax, ay] = centres[i];
    const [bx, by] = centres[(i + 1) % centres.length];
    for (const bow of [0.18, -0.09]) {
      const mx = (ax + bx) / 2 + (by - ay) * bow;
      const my = (ay + by) / 2 - (bx - ax) * bow;
      arcs.push(`M${r1(ax)} ${r1(ay)}Q${r1(mx)} ${r1(my)} ${r1(bx)} ${r1(by)}`);
    }
  }

  /*
   * A second order inside each cluster: the satellites are chained to their
   * neighbours as well as to the hub.
   *
   * A pure star says "one model, many calls". The ring around it says the
   * narrow agents talk to each other too, which is the actual claim in the
   * paragraph beside the drawing.
   */
  for (let c = 0; c < centres.length; c += 1) {
    const ring = satellites[c];
    for (let i = 0; i < ring.length; i += 1) {
      if (random() < 0.32) continue;
      const [ax, ay] = ring[i];
      const [bx, by] = ring[(i + 1) % ring.length];
      rings[c].push(line(ax, ay, bx, by));
    }
  }

  return svg(
    "schematic: agent swarms",
    `<g fill="none">
  <path d="${arcs.join("")}" stroke="${FLOW}" stroke-width="3.4" opacity="0.8"/>
${HUES.map(
  (hue, i) => `  <g stroke="${hue}">
    <path d="${rings[i].join("")}" stroke-width="1.5" opacity="0.42"/>
    <path d="${links[i].join("")}" stroke-width="2.2" opacity="0.68"/>
    <g fill="${hue}" stroke="none" opacity="0.92">${dots[i].join("")}</g>
  </g>`,
).join("\n")}
  ${hubs.join("")}
</g>`,
  );
}

/*
 * 03 — Systems Integration. One hub, four named systems, wired.
 *
 * The boxes used to be deliberately anonymous, on the argument that naming a CRM
 * dates the drawing and implies an integration we have not built. The owner's
 * call reverses it, and the reasoning is better than the old one: "custom
 * solutions for SaaS and enterprises" is an abstraction until you see the four
 * places the work actually lands, and everyone reading it already has an opinion
 * about at least one of them. Four blank plates say nothing; HubSpot, Salesforce,
 * the Graph API and Slack say what the sentence beside them means.
 *
 * ## The plates carry the real marks
 *
 * A second owner call, and the reason is the same one again: a plate reading
 * "HubSpot" in mono is a drawing of a label, and a plate carrying the sprocket
 * is a drawing of HubSpot. Set in type it reads as a wireframe of a diagram;
 * with the marks on it, it reads as the systems themselves.
 *
 * **Each mark is the vendor's own file, and this script never draws one.**
 * Approximating a trademark from memory produces a wrong mark, which looks
 * amateur exactly where the drawing is trying to look real, and is the one
 * thing every brand guideline on earth forbids outright. So the marks are
 * inputs: drop `<slug>.svg` into `scripts/logos/` and it is picked up on the
 * next `npm run gen:diagrams`. Missing files are not an error — that plate
 * falls back to its name in type, which is what shipped before this and is
 * still a perfectly good drawing.
 *
 * They are flattened to a single tone on the way in (see `flattenMark`).
 * Brand colour would put four stickers on a metal drawing, and one-colour is
 * both the coherent choice and the usage every one of these four explicitly
 * permits.
 *
 * See docs/adr/0008-third-party-marks-in-the-schematics.md, which reverses 0003
 * for these four files only.
 */
/*
 * `[slug, name, kind]`.
 *
 * `kind` is what the vendor's own file actually contains, and it decides
 * whether the plate sets the name beside the mark:
 *
 *   "glyph"   a bare symbol — the cloud, the hash, the infinity. Nobody is
 *             obliged to recognise a symbol, so the plate names it.
 *   "lockup"  the mark with its wordmark already in it. HubSpot publishes its
 *             logo this way — the sprocket *is* the "o" in "HubSpot" and does
 *             not come apart — so a name beside it is the word twice.
 *
 * Stated per vendor rather than guessed from the file's aspect ratio. A wide
 * viewBox is evidence of a lockup and not proof of one, and the failure mode
 * of guessing is a plate that says "Slack Slack" the day Slack ships a
 * differently-proportioned glyph.
 */
const SYSTEMS = [
  ["hubspot", "HubSpot", "lockup"],
  ["salesforce", "Salesforce", "glyph"],
  ["meta", "Meta Graph API", "glyph"],
  ["slack", "Slack", "glyph"],
];

/**
 * The vendor marks, by slug — `{ body, minX, minY, width, height }` — or an
 * empty map when none are present.
 *
 * Populated once before anything is drawn, because `integration()` is sync and
 * called from a sync loop.
 */
let MARKS = new Map();

/**
 * Strip a mark down to geometry this drawing can tone itself.
 *
 * Every paint attribute comes off so the wrapper's `fill` is what lands:
 * `fill`, `stroke`, the opacities, `class` (which is usually where a brand SVG
 * keeps its palette), and any `<style>` block. `fill-rule` and `clip-rule`
 * survive on purpose — they are geometry, not paint, and a mark with a hole in
 * it (the Slack hash, the HubSpot sprocket) fills solid without them.
 *
 * If a mark comes out looking wrong, the file almost certainly paints itself
 * through a `<style>` block or a gradient. Flatten it in the source file rather
 * than teaching this regex to parse CSS.
 */
function flattenMark(body) {
  return body
    .replace(/<\?xml[\s\S]*?\?>/gi, "")
    .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(title|desc|metadata|style)\b[\s\S]*?<\/\1>/gi, "")
    .replace(/\s(?:fill|stroke|style|class|opacity|fill-opacity|stroke-opacity)="[^"]*"/gi, "")
    .replace(/\s(?:fill|stroke|style|class|opacity|fill-opacity|stroke-opacity)='[^']*'/gi, "")
    .trim();
}

/** Read whatever marks are present. A missing file is a fallback, not a failure. */
async function loadMarks() {
  const marks = new Map();

  for (const [slug] of SYSTEMS) {
    let raw;
    try {
      raw = await readFile(resolve(LOGO_DIR, `${slug}.svg`), "utf8");
    } catch {
      continue;
    }

    const open = /<svg\b([^>]*)>/i.exec(raw);
    if (!open) {
      console.warn(`  ! ${slug}.svg — no <svg> element; skipped`);
      continue;
    }

    const viewBox = /viewBox="([^"]+)"/i.exec(open[1]);
    const box = viewBox
      ? viewBox[1]
          .trim()
          .split(/[\s,]+/)
          .map(Number)
      : [
          0,
          0,
          Number(/width="([\d.]+)/i.exec(open[1])?.[1]),
          Number(/height="([\d.]+)/i.exec(open[1])?.[1]),
        ];

    if (box.length !== 4 || box.some((n) => !Number.isFinite(n)) || box[2] <= 0 || box[3] <= 0) {
      console.warn(`  ! ${slug}.svg — no usable viewBox; skipped`);
      continue;
    }

    const body = flattenMark(raw.slice(open.index + open[0].length, raw.lastIndexOf("</svg>")));
    if (!body) {
      console.warn(`  ! ${slug}.svg — empty after flattening; skipped`);
      continue;
    }

    marks.set(slug, { body, minX: box[0], minY: box[1], width: box[2], height: box[3] });
  }

  return marks;
}

function integration() {
  const random = rng(0x6b12);
  const cx = W * 0.5;
  const cy = H * 0.5;

  /*
   * Wide enough for a glyph, a gap, and the longest name — "Meta Graph API",
   * 14 characters — at a size that survives being painted at roughly half
   * scale, and tall enough for a header and the record under it.
   *
   * This went 216 → 240 when the marks arrived: the name used the full width
   * before, and a 30-unit glyph slot in front of it has to come from
   * somewhere. The runs to the hub lose the same 24 units at each end, which
   * they can afford — they were 114 units of wire and are now 90.
   */
  const bw = 240;
  const bh = 104;
  const hubR = 46;
  const spots = [
    [W * 0.03, H * 0.08],
    [W * 0.97 - bw, H * 0.15],
    [W * 0.03, H * 0.72],
    [W * 0.97 - bw, H * 0.66],
  ];

  /*
   * A hue per system, and here the four hues are an **index rather than a
   * meaning** — the only place in the set where they are. This drawing's whole
   * claim is that the work lands in four different places you already run, and
   * four wires in one tone say "wired" where four in four say "four". The rule
   * under each name, the port it leaves through, the run to the hub and the
   * joint on that run all share the system's colour, so a wire can be followed
   * back to the plate it came from without tracing it.
   */
  const HUES = [HELD, DATA, FLOW, DROP];

  const boxes = [];
  const labels = [];
  const wiring = [];

  const fields = [];
  for (const [i, [bx, by]] of spots.entries()) {
    const hue = HUES[i];
    boxes.push(box(bx, by, bw, bh));

    /*
     * A header, then the record under it.
     *
     * The name sits above a full-width rule, the way the top of a table does,
     * and the field lines below it are of uneven length so the four read as
     * systems holding different things rather than as one shape stamped out
     * four times.
     */
    /*
     * The header: a mark, a name, or both.
     *
     * A glyph gets a **fixed slot** rather than being fitted to its own
     * bounding box — 30 wide by 26 tall, the glyph centred inside it — so that
     * the names all start on the same x no matter how wide or narrow the
     * symbol beside them is. Four names on four different indents is the thing
     * that makes a set of plates look assembled by accident.
     *
     * A lockup is fitted optically instead, because it has no name beside it
     * to line up with: its height budget scales with the inverse root of its
     * aspect, which holds roughly the *area* steady. Set to one height a wide
     * lockup reads as a banner next to a square glyph reading as a speck, even
     * though the number is identical.
     *
     * The `translate(-minX -minY)` is what makes a viewBox that does not start
     * at the origin land on the plate rather than off it.
     */
    const [slug, name, kind] = SYSTEMS[i];
    const mark = MARKS.get(slug);

    const place = (m, scale, x, y) =>
      `<g fill="${LINE}" fill-opacity="0.92" stroke="none" ` +
      `transform="translate(${r1(x)} ${r1(y)}) scale(${scale.toFixed(4)}) ` +
      `translate(${r1(-m.minX)} ${r1(-m.minY)})">${m.body}</g>`;

    const setName = (x, size) =>
      `<text x="${r1(x)}" y="${r1(by + 30)}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" ` +
      `font-size="${size}" letter-spacing="0.5" fill="${LINE}" fill-opacity="0.92">${name}</text>`;

    if (mark && kind === "glyph") {
      const SLOT_W = 30;
      const SLOT_H = 26;
      const scale = Math.min(SLOT_H / mark.height, SLOT_W / mark.width);
      labels.push(
        place(
          mark,
          scale,
          bx + 16 + (SLOT_W - mark.width * scale) / 2,
          by + 22 - (mark.height * scale) / 2,
        ),
        setName(bx + 16 + SLOT_W + 10, 18),
      );
    } else if (mark) {
      const aspect = mark.width / mark.height;
      const target = Math.max(18, Math.min(30, 26 * (1.6 / Math.sqrt(aspect))));
      const scale = Math.min(target / mark.height, (bw - 32) / mark.width);
      labels.push(place(mark, scale, bx + 16, by + 22 - (mark.height * scale) / 2));
    } else {
      // No file for this one yet. The name takes the whole header, which is
      // what every plate did before the marks existed.
      labels.push(setName(bx + 16, 21));
    }

    const rule = line(bx, by + 44, bx + bw, by + 44);

    for (let f = 0; f < 3; f += 1) {
      const fy = by + 62 + f * 16;
      const fw = 44 + random() * 104;
      fields.push(line(bx + 16, fy, bx + 16 + fw, fy));
      // A value against the field, hard right — the shape of a record, without
      // inventing data nobody can read at this size anyway.
      fields.push(line(bx + bw - 16 - (14 + random() * 26), fy, bx + bw - 16, fy));
    }

    // Arrive on the hub's rim at the angle the box actually sits, so four runs
    // meet the circle at four points instead of stacking onto one centreline.
    const px = bx + bw / 2 < cx ? bx + bw : bx;
    const py = by + bh / 2;

    // The port the run leaves through: a system has connectors, and a line
    // touching a bare rectangle reads as a line that happens to end there.
    const port = `<rect x="${r1(px - 7)}" y="${r1(py - 7)}" width="14" height="14"/>`;
    const a = Math.atan2(cy - py, cx - px);
    const hx = cx - Math.cos(a) * hubR;
    const hy = cy - Math.sin(a) * hubR;
    const run = line(px, py, hx, hy);

    const t = 0.52 + random() * 0.12;
    const jx = px + (hx - px) * t;
    const jy = py + (hy - py) * t;
    const s = 9 + random() * 5;
    const joint =
      `<rect x="${r1(jx - s / 2)}" y="${r1(jy - s / 2)}" width="${r1(s)}" height="${r1(s)}" ` +
      `transform="rotate(${r1((a * 180) / Math.PI)} ${r1(jx)} ${r1(jy)})"/>`;

    /*
     * The bit on the wire.
     *
     * A second copy of the run, stroked with a dash 2.5% of its own length and
     * rounded off at both ends, so it reads as one packet rather than as a
     * tick. `pathLength="100"` is what makes the four behave identically: it
     * renormalises every run to 100 units regardless of how long it actually
     * is, so one dasharray and one keyframe drive all four and a bit crosses a
     * short wire and a long one in the same time.
     *
     * Dash-offset rather than `offset-path`: this has to animate while the
     * drawing is a CSS `background-image`, where a motion path is far less
     * reliably supported than a dash is, and the dash costs the compositor a
     * stroke it was already drawing.
     */
    // The port is filled with paper *after* the run is drawn, so the wire stops
    // at the connector instead of running through it — and the bit slides under
    // the connector as it arrives rather than stopping short of it.
    wiring.push(`  <g stroke="${hue}" fill="none">
    <path d="${run}" stroke-width="3.2" opacity="0.85"/>
    <path class="bit b${i}" d="${run}" pathLength="100" stroke-width="5.4"/>
    <path d="${rule}" stroke-width="2.8" opacity="0.85"/>
    <g stroke-width="3" fill="${PAPER}">${port}</g>
    <g fill="${hue}" stroke="none">${joint}</g>
  </g>`);
  }

  /*
   * A second orbit outside the tick ring: the traffic that never lands, going
   * round. It is what stops the hub reading as a full stop at the end of four
   * lines — the point of the drawing is that this thing is *running*.
   */
  const orbit = [];
  const orbitR = hubR + 46;
  for (let i = 0; i < 5; i += 1) {
    const a0 = (i / 5) * Math.PI * 2 + 0.2;
    const a1 = a0 + 0.62 + random() * 0.3;
    orbit.push(
      `M${r1(cx + Math.cos(a0) * orbitR)} ${r1(cy + Math.sin(a0) * orbitR)}` +
        `A${r1(orbitR)} ${r1(orbitR)} 0 0 1 ` +
        `${r1(cx + Math.cos(a1) * orbitR)} ${r1(cy + Math.sin(a1) * orbitR)}`,
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

  /*
   * The one animated drawing in the set.
   *
   * Four bits leaving the hub, one per system, on slightly different clocks so
   * they never march in step — traffic rather than a metronome. That is the
   * whole animation: the drawing says this thing is *running*, which is what
   * the orbit and the tick ring were already reaching for and could only imply
   * from a standstill.
   *
   * ## Why CSS, in the file
   *
   * The schematic is painted as a `background-image`, and an SVG used that way
   * runs no script at all — so this cannot be driven from `BlockFrame` the way
   * every other moving thing on the site is. Declarative animation *does* run
   * there, which makes a stylesheet inside the file the only mechanism
   * available, and the reason this one asset breaks the "the frame moves
   * things, blocks do not" rule in docs/brief.md.
   *
   * It also buys the thing SMIL could not: `prefers-reduced-motion` is a media
   * query, so the file can honour it on its own (CLAUDE.md §3.4). Reduced
   * motion parks each bit part-way along its wire instead of hiding it — a
   * still frame of the same idea, rather than a drawing with something
   * conspicuously missing from it.
   */
  const bits = SYSTEMS.map(
    (_, i) =>
      `  .b${i} { animation-duration: ${(3.4 + i * 0.45).toFixed(2)}s; animation-delay: -${(i * 0.9).toFixed(2)}s; }`,
  ).join("\n");

  const style = `<style>
  .bit { stroke-dasharray: 2.5 97.5; stroke-linecap: round; animation-name: bit; animation-timing-function: linear; animation-iteration-count: infinite; }
  @keyframes bit { from { stroke-dashoffset: 0; } to { stroke-dashoffset: 100; } }
${bits}
  @media (prefers-reduced-motion: reduce) {
    .bit { animation: none; stroke-dashoffset: 62; }
  }
</style>`;

  return svg(
    "schematic: systems integration",
    `${style}
<g stroke="${LINE}" fill="none">
  <path d="${fields.join("")}" stroke-width="1.8" opacity="0.45"/>
  <g stroke-width="3.6" opacity="0.9">${boxes.join("")}</g>
  ${labels.join("")}
</g>
<g fill="none">
${wiring.join("\n")}
  <path d="${orbit.join("")}" stroke="${FLOW}" stroke-width="2.2" opacity="0.55"/>
  <path d="${ticks.join("")}" stroke="${LINE}" stroke-width="3.4" opacity="0.8" stroke-linecap="butt"/>
  <circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(hubR)}" stroke="${LINE}" stroke-width="3.8" opacity="0.95"/>
  <circle cx="${r1(cx)}" cy="${r1(cy)}" r="13" fill="${CORE}" stroke="${LINE}" stroke-width="3.4"/>
</g>`,
    `0 ${r1(H * 0.08 - 26)} ${W} ${r1(H * 0.72 + bh + 26 - (H * 0.08 - 26))}`,
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

/*
 * 03 — Micro agents. One task each, and that is the whole drawing: a row of
 * small self-contained units, every one a single input, a single body, a single
 * output, with nothing running between them. The swarm above is about handoff;
 * this is about the opposite — a bot that does one thing and stops, which is
 * what makes it cheap to add and safe to remove.
 */
function micro() {
  const random = rng(0x77c1);
  const cols = 3;
  const rows = 2;
  const cellW = W / cols;
  const cellH = H / rows;

  const bodies = [];
  const feedIn = [];
  const feedOut = [];
  const rules = [];
  const queue = [];
  const delivered = [];
  const lamps = [];

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const cx = cellW * (c + 0.5);
      const cy = cellH * (r + 0.5);
      const w = 116 + random() * 26;
      const h = 74 + random() * 20;

      bodies.push(box(cx - w / 2, cy - h / 2, w, h));

      /*
       * In on the left, out on the right, and nothing crossing to a neighbour —
       * that isolation is the whole claim, so the detail all has to live
       * *inside* each unit rather than between them.
       *
       * Three things inside: a short queue of work waiting at the mouth, a
       * stack of rules the unit runs down, and one lamp for its state. That is
       * about as much as a bot doing one task actually has in it, and drawing
       * more would be inventing complexity rather than showing it.
       *
       * Colour is what tells the two sides of a unit apart: `HELD` arrives,
       * `FLOW` leaves. Six identical grey boxes said only "six boxes"; the same
       * six with a warm mouth and a cool outlet say which way the work goes,
       * which is the one thing the drawing has to get across.
       */
      feedIn.push(line(cx - w / 2 - 54, cy, cx - w / 2, cy));
      feedOut.push(line(cx + w / 2, cy, cx + w / 2 + 54, cy));
      delivered.push(node(cx + w / 2 + 54, cy, 6.5));

      // The queue: three items waiting, the nearest one largest.
      for (let q = 0; q < 3; q += 1) {
        queue.push(node(cx - w / 2 - 54 - q * 17, cy, 6 - q * 1.4));
      }

      // The rule stack, ruled off from the body's left edge.
      const ruleCount = 3;
      for (let k = 0; k < ruleCount; k += 1) {
        const ry = cy - h / 2 + (h / (ruleCount + 1)) * (k + 1);
        const rw = 26 + random() * 30;
        rules.push(line(cx - w / 2 + 14, ry, cx - w / 2 + 14 + rw, ry));
      }

      // The lamp: this unit is running.
      lamps.push(`<circle cx="${r1(cx + w / 2 - 17)}" cy="${r1(cy - h / 2 + 16)}" r="7"/>`);
    }
  }

  return svg(
    "schematic: micro agents",
    `<g fill="none">
  <g stroke="${LINE}" stroke-width="3.2" opacity="0.9">${bodies.join("")}</g>
  <path d="${rules.join("")}" stroke="${DATA}" stroke-width="2.4" opacity="0.75"/>
  <path d="${feedIn.join("")}" stroke="${HELD}" stroke-width="2.4" opacity="0.72"/>
  <path d="${feedOut.join("")}" stroke="${FLOW}" stroke-width="2.4" opacity="0.78"/>
  <g fill="${CORE}" stroke="${LINE}" stroke-width="2.6">${lamps.join("")}</g>
</g>
<g fill="${HELD}" stroke="none" opacity="0.85">${queue.join("")}</g>
<g fill="${FLOW}" stroke="none" opacity="0.9">${delivered.join("")}</g>`,
    // Cropped to the units. `contain` fits the whole viewBox, so the blank third
    // above and below the two rows was blank space the browser reproduced
    // faithfully — the drawing rendered at two thirds the size its box allowed.
    `0 ${r1(H * 0.16)} ${W} ${r1(H * 0.68)}`,
  );
}

/*
 * 04 — AI pipelines. A stage machine read left to right: source, three
 * transforms, sink, with the work fanning out inside a stage and collapsing
 * again at its mouth. The fan is the point — a pipeline is not a queue, it is a
 * place where one record becomes many operations and then one record again.
 */
function pipeline() {
  const random = rng(0x3b90);
  const y = H * 0.5;
  const stages = 4;
  const x0 = W * 0.09;
  const x1 = W * 0.91;
  const step = (x1 - x0) / stages;

  const spine = [];
  const gates = [];
  const meters = [];
  const fans = [];
  const rejects = [];
  const fanDots = [];
  const gateDots = [];
  const rejectDots = [];
  const source = [];
  const sink = [];

  spine.push(line(x0, y, x1, y));

  for (let i = 0; i <= stages; i += 1) {
    const x = x0 + step * i;
    /*
     * The two ends are not two more gates, and colour is the cheapest way to
     * say so: raw work arrives in `HELD` at the left and leaves finished as the
     * live mark at the right. Read left to right, the drawing now states its
     * own sentence — in, through, out — where five identical dots stated only
     * that there were five of something.
     */
    if (i === 0) source.push(node(x, y, 11.5));
    else if (i === stages) sink.push(`<circle cx="${r1(x)}" cy="${r1(y)}" r="12.5"/>`);
    else gateDots.push(node(x, y, 7.5));
    if (i === stages) break;

    // Between each pair of gates the stream splits and rejoins.
    const mid = x + step / 2;
    const branches = 2 + Math.floor(random() * 2);
    for (let bIndex = 0; bIndex < branches; bIndex += 1) {
      const spread = (bIndex - (branches - 1) / 2) * (46 + random() * 18);
      if (Math.abs(spread) < 1) continue;
      fans.push(`M${r1(x)} ${r1(y)}Q${r1(mid)} ${r1(y + spread)} ${r1(x + step)} ${r1(y)}`);
      fanDots.push(node(mid, y + spread * 0.78, 4.5));
    }

    // The gate itself: a narrow upright the stream passes through, with a short
    // meter beside it — how much of the batch this stage held on to. The meter
    // is the one part of a gate that carries a *quantity*, so it is the part
    // that takes `HELD`; the upright stays structure.
    gates.push(line(x, y - 44, x, y + 44));
    const fill = 12 + random() * 30;
    meters.push(line(x + 7, y - 44, x + 7, y - 44 + fill));

    /*
     * The reject path.
     *
     * Every real pipeline has one and no diagram of a pipeline ever draws it,
     * which is why they all look like plumbing rather than like work. A short
     * fall away from the spine at each gate, ending in a dot: the records this
     * stage would not pass. In `DROP`, because a refusal that looks exactly
     * like the main line is a refusal the reader walks straight past.
     */
    if (i > 0) {
      const dropY = y + 96 + random() * 26;
      rejects.push(`M${r1(x)} ${r1(y)}Q${r1(x)} ${r1(dropY - 18)} ${r1(x - 26)} ${r1(dropY)}`);
      rejectDots.push(node(x - 26, dropY, 5.5));
    }
  }

  return svg(
    "schematic: ai pipelines",
    `<g fill="none">
  <path d="${fans.join("")}" stroke="${FLOW}" stroke-width="2.3" opacity="0.6"/>
  <path d="${rejects.join("")}" stroke="${DROP}" stroke-width="2.3" opacity="0.72"/>
  <path d="${spine.join("")}" stroke="${LINE}" stroke-width="3.6" opacity="0.9"/>
  <path d="${gates.join("")}" stroke="${LINE}" stroke-width="2.4" opacity="0.5"/>
  <path d="${meters.join("")}" stroke="${HELD}" stroke-width="3.4" opacity="0.9"/>
  <g fill="${CORE}" stroke="${LINE}" stroke-width="3.2">${sink.join("")}</g>
</g>
<g stroke="none">
  <g fill="${FLOW}" opacity="0.8">${fanDots.join("")}</g>
  <g fill="${DROP}" opacity="0.85">${rejectDots.join("")}</g>
  <g fill="${DATA}" opacity="0.9">${gateDots.join("")}</g>
  <g fill="${HELD}" opacity="0.95">${source.join("")}</g>
</g>`,
    // Cropped to the spine plus the reject drops hanging under it.
    `0 ${r1(H * 0.24)} ${W} ${r1(H * 0.46)}`,
  );
}

const FILES = [
  ["mapping", mapping],
  ["swarm", swarm],
  ["integration", integration],
  ["micro", micro],
  ["pipeline", pipeline],
  ["build", build],
  ["tune", tune],
];

MARKS = await loadMarks();
console.log(
  MARKS.size
    ? `marks: ${[...MARKS.keys()].join(", ")} (${SYSTEMS.length - MARKS.size} falling back to type)`
    : `marks: none in scripts/logos — every plate falls back to its name in type`,
);

await mkdir(OUT_DIR, { recursive: true });

for (const [name, draw] of FILES) {
  const out = draw();
  await writeFile(resolve(OUT_DIR, `${name}.svg`), out, "utf8");
  console.log(`${name}.svg — ${(out.length / 1024).toFixed(1)} KB`);
}
