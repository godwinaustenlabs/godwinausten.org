#!/usr/bin/env node
/**
 * Draws the second figure: a woman mid-stride, arms open, in fluorescent wire.
 *
 *   npm run gen:ascent   →  public/assets/figure-ascent.svg
 *
 * ## Why this is generated and the hero's is traced
 *
 * `public/assets/figure.svg` is one pose because it is a *trace* of one
 * photograph (`docs/adr/0004`), and there is no second photograph to trace. A
 * different figure therefore has to be drawn, and drawing it procedurally is the
 * approach that ADR was written to reject — three attempts at an original hero
 * figure produced fuzz, then visible sine coils, then something that read as
 * generated rather than drawn.
 *
 * What is different here is the job and the treatment, and both forgive what
 * defeated those attempts:
 *
 * - **It is not the hero.** The hero is a near-black drawing on paper at the top
 *   of the page that has to sell, and every wobble in it is under a spotlight.
 *   This sits on an ink panel beside a statement, at half the size.
 * - **It is lit rather than inked.** Fluorescent line at partial opacity on
 *   black behaves like a long exposure, and the eye grants a light trail an
 *   irregularity it refuses a pen line.
 *
 * ## Sharp, not soft — what the second pass changed
 *
 * The first version was all *winding*: every stroke a wandering line spiralling
 * along a limb. It read as a person, and it read as wool. What it had no way to
 * produce was an edge, because nothing in it was ever straight and nothing ever
 * stopped in the same place twice.
 *
 * So the drawing is now three things doing three jobs, and the split is the
 * whole difference:
 *
 * - **Contours.** A handful of lines per limb riding the tube at a *fixed*
 *   offset with almost no wobble. These are the silhouette, and they are what
 *   makes the figure cut against the black instead of dissolving into it.
 * - **Facets.** Straight chords between the surface points of neighbouring
 *   rings, in triangles. Every one is a dead-straight segment with two hard
 *   corners — the only source of an actual edge in the drawing, and the reason
 *   it now reads as something machined rather than something knitted.
 * - **Runners.** The winding lines, kept but fewer and tighter. They are the
 *   connective tissue between the other two, not the subject.
 *
 * `stroke-linejoin="miter"` and `stroke-linecap="butt"` throughout: the small
 * decision that leaves the facet corners sharp instead of rounding every one of
 * them off.
 *
 * ## The figure
 *
 * A woman, striding to her left with both arms open — one swept low and out
 * toward the copy beside her, one raised. The proportions do the reading:
 * shoulders narrower than the hips, a defined waist between them, a smaller head
 * against a longer leg line. An open, arriving pose rather than a departing one,
 * because the section it belongs to is an invitation.
 *
 * Every random number comes from a seeded generator, so the file is identical on
 * every machine and a regeneration is a no-op unless a constant here changed.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "public/assets/figure-ascent.svg");

/** Change this and the whole drawing is a different one. */
const SEED = Number(process.env.ASCENT_SEED ?? 4180923);

const WIDTH = 1000;
const HEIGHT = 1200;

/**
 * The pose and the proportions, as joints. The only place the figure's shape
 * lives.
 *
 * `r` is the half-width of the form at that joint, and those numbers *are* the
 * figure. A wire drawing has no surface and no shading, so the silhouette is the
 * only thing that can say who this is, and it says it with four measurements:
 * the chest narrower than the hip by a third, a waist cut to well under half the
 * hip between them, shoulder joints pulled inboard of the ribs, and the hip high
 * enough that the legs are longer than the torso. The first pass had the chest
 * and hip within a few units of each other and read as anybody.
 *
 * The stride is to her left and the arms are open — one swept low and outward,
 * one raised. Read against the hero, which stands square and reaches with one
 * hand: that one is a figure *asking*, this one is a figure *arriving*.
 */
const JOINTS = {
  head: { x: 436, y: 140, r: 50 },
  neck: { x: 450, y: 214, r: 20 },
  chest: { x: 464, y: 268, r: 62 },
  bust: { x: 472, y: 338, r: 78 },
  waist: { x: 484, y: 436, r: 42 },
  hip: { x: 500, y: 540, r: 98 },

  // The near arm, swept low and open toward the copy beside her.
  shoulderOpen: { x: 414, y: 272, r: 27 },
  elbowOpen: { x: 292, y: 358, r: 21 },
  wristOpen: { x: 182, y: 410, r: 14 },
  handOpen: { x: 112, y: 430, r: 20 },

  // The far arm, raised.
  shoulderHigh: { x: 526, y: 274, r: 27 },
  elbowHigh: { x: 642, y: 206, r: 21 },
  wristHigh: { x: 714, y: 92, r: 14 },
  handHigh: { x: 746, y: 26, r: 20 },

  // The leading leg, stepping out.
  hipLead: { x: 448, y: 562, r: 50 },
  kneeLead: { x: 346, y: 766, r: 31 },
  ankleLead: { x: 262, y: 956, r: 16 },
  footLead: { x: 208, y: 994, r: 15 },

  // The trailing leg, pushing off.
  hipTrail: { x: 556, y: 564, r: 50 },
  kneeTrail: { x: 632, y: 778, r: 31 },
  ankleTrail: { x: 680, y: 982, r: 16 },
  footTrail: { x: 744, y: 1010, r: 15 },
};

/**
 * The limbs, each a chain of joints.
 *
 * `spine` runs neck → chest → bust → waist → hip, which is the line that carries
 * the proportion — so it is the one limb whose contours are drawn heaviest.
 */
const LIMBS = [
  { key: "spine", of: ["neck", "chest", "bust", "waist", "hip"] },
  { key: "armOpen", of: ["shoulderOpen", "elbowOpen", "wristOpen", "handOpen"] },
  { key: "armHigh", of: ["shoulderHigh", "elbowHigh", "wristHigh", "handHigh"] },
  { key: "legLead", of: ["hipLead", "kneeLead", "ankleLead", "footLead"] },
  { key: "legTrail", of: ["hipTrail", "kneeTrail", "ankleTrail", "footTrail"] },
];

/**
 * The long chains, for the runners.
 *
 * These cross joints on purpose — hand to shoulder to hip to ankle — because a
 * line that travels the whole body is what makes this one drawing rather than
 * five limbs that happen to meet.
 */
const CHAINS = [
  { weight: 4, of: ["handOpen", "wristOpen", "elbowOpen", "shoulderOpen", "chest", "bust", "hip"] },
  { weight: 4, of: ["handHigh", "wristHigh", "elbowHigh", "shoulderHigh", "chest", "bust", "hip"] },
  { weight: 5, of: ["chest", "bust", "waist", "hip", "hipLead", "kneeLead", "ankleLead"] },
  { weight: 5, of: ["chest", "bust", "waist", "hip", "hipTrail", "kneeTrail", "ankleTrail"] },
  // Shoulder to opposite ankle — the line that carries the twist of the stride.
  {
    weight: 3,
    of: ["shoulderOpen", "chest", "waist", "hip", "hipTrail", "kneeTrail", "ankleTrail"],
  },
  { weight: 3, of: ["shoulderHigh", "chest", "waist", "hip", "hipLead", "kneeLead", "ankleLead"] },
  { weight: 3, of: ["head", "neck", "chest", "bust", "waist", "hip"] },
];

/**
 * Fluorescent, and deliberately short.
 *
 * Six colours was a rainbow — the thing the brief already caught the Labs
 * watermark doing. Five carry the drawing: a near-white that is most of the
 * line, the site's own lime, a cold cyan and a hot magenta at the extremes, and
 * amber as the warm note that keeps the whole thing from reading clinical. They
 * are picked by where a stroke sits down the figure, so the palette runs as a
 * gradient through her rather than as confetti — `bias` is that position, 0 at
 * the head and 1 at the feet.
 */
const PALETTE = [
  { hex: "#EFFFF7", bias: 0.5, weight: 9 }, // the structural line
  { hex: "#C6FF3E", bias: 0.22, weight: 4 },
  { hex: "#2BE8FF", bias: 0.62, weight: 4 },
  { hex: "#FF2D95", bias: 0.88, weight: 3 },
  { hex: "#FFB020", bias: 0.4, weight: 2 },
];

/** How many contour lines ride each limb's surface. The silhouette. */
const CONTOURS_PER_LIMB = 7;
/** Rings sampled per limb for the facets to span between. */
const FACET_RINGS = 15;
/** Chords drawn between each pair of neighbouring rings. */
const FACETS_PER_GAP = 5;
const RUNNERS = 74;
const HEAD_FACETS = 34;
/** Strands thrown back off the crown. See the head block for why they matter. */
const HAIR_STRANDS = 26;

/* ------------------------------------------------------------------ */

/** Seeded LCG. The file has to be identical on every machine that builds it. */
let state = SEED >>> 0;
const rnd = () => {
  state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
  return state / 4294967296;
};
const between = (lo, hi) => lo + rnd() * (hi - lo);

/** Weighted pick over `{ weight }` entries. */
function pickWeighted(list) {
  const total = list.reduce((sum, item) => sum + item.weight, 0);
  let roll = rnd() * total;
  for (const item of list) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return list[list.length - 1];
}

/**
 * Smooth pseudo-noise over one dimension.
 *
 * Three sines at unrelated frequencies. Not real Perlin noise and it does not
 * need to be: what a wandering line wants is something continuous that never
 * visibly repeats over the length of a limb, and a sum of incommensurable sines
 * is that for a tenth of the code.
 */
function wobbler() {
  const a = between(1.1, 2.4);
  const b = between(3.3, 6.1);
  const c = between(8.5, 14.0);
  const pa = rnd() * Math.PI * 2;
  const pb = rnd() * Math.PI * 2;
  const pc = rnd() * Math.PI * 2;
  return (t) =>
    0.6 * Math.sin(a * t + pa) + 0.28 * Math.sin(b * t + pb) + 0.12 * Math.sin(c * t + pc);
}

/**
 * Catmull–Rom through the joints, sampled evenly.
 *
 * A chain joined with straight lines has a visible corner at every elbow and
 * knee, and anything riding it inherits the corner. The spline is what makes a
 * limb a curve — which matters more here than in the first version, because the
 * contours hug the surface tightly enough to show every fault in it.
 */
function centreline(names, steps) {
  const pts = names.map((name) => JOINTS[name]);
  const out = [];
  const at = (i) => pts[Math.max(0, Math.min(pts.length - 1, i))];

  for (let s = 0; s <= steps; s += 1) {
    const u = (s / steps) * (pts.length - 1);
    const i = Math.min(pts.length - 2, Math.floor(u));
    const t = u - i;
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const t2 = t * t;
    const t3 = t2 * t;
    const cr = (a, b, c, d) =>
      0.5 *
      (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
    out.push({
      x: cr(p0.x, p1.x, p2.x, p3.x),
      y: cr(p0.y, p1.y, p2.y, p3.y),
      r: cr(p0.r, p1.r, p2.r, p3.r),
    });
  }
  return out;
}

/** Unit normal and tangent of the centreline at `i`. */
function frameAt(line, i) {
  const a = line[Math.max(0, i - 1)];
  const b = line[Math.min(line.length - 1, i + 1)];
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  return { n: { x: -dy / len, y: dx / len }, t: { x: dx / len, y: dy / len } };
}

/**
 * A point on the surface of the tube at `i`, at angle `a` around it.
 *
 * The figure is drawn flat, so "around the tube" is a cheat: the normal gives
 * the full radius and the tangent a squashed one, which is what a circle seen
 * almost edge-on looks like. It is enough to make a chord between two of them
 * read as crossing a solid rather than as lying on a plane.
 */
function surface(line, i, a, squash = 0.34) {
  const p = line[i];
  const { n, t } = frameAt(line, i);
  const u = Math.cos(a) * p.r;
  const v = Math.sin(a) * p.r * squash;
  return { x: p.x + n.x * u + t.x * v, y: p.y + n.y * u + t.y * v };
}

const round = (n) => Math.round(n);

/** A polyline as an SVG path. Integers — the drawing is 1000 units wide. */
function toPath(points) {
  return points.map((p, i) => `${i === 0 ? "M" : "L"}${round(p.x)} ${round(p.y)}`).join("");
}

/** Colour for a stroke sitting at `pos` down the figure (0 head, 1 feet). */
function paint(pos) {
  const weighted = PALETTE.map((entry) => ({
    ...entry,
    // Colours are attracted to their own band of the body; the structural line
    // is not, so it appears everywhere.
    weight: entry.weight * (entry.bias === 0.5 ? 1 : 0.3 + 1.7 * (1 - Math.abs(entry.bias - pos))),
  }));
  return pickWeighted(weighted).hex;
}

const strokes = [];
const depth = (p) => Math.min(1, Math.max(0, p.y / HEIGHT));

/*
 * Contours — the silhouette.
 *
 * Fixed offsets, near-zero wobble, and the brightest opacities in the drawing.
 * The angles cluster near ±90°, which is where the tube's edge is: a contour at
 * 0° runs down the middle of a limb and tells the eye nothing about its shape.
 */
for (const limb of LIMBS) {
  const line = centreline(limb.of, 150);
  const spine = limb.key === "spine";

  for (let k = 0; k < CONTOURS_PER_LIMB; k += 1) {
    // Alternating sides, fanned in from the true edge.
    const side = k % 2 === 0 ? 1 : -1;
    const spread = (Math.floor(k / 2) / Math.ceil(CONTOURS_PER_LIMB / 2)) * 0.5;
    const angle = side * (Math.PI / 2) * (1 - spread * between(0.5, 1));
    const drift = wobbler();

    const points = [];
    for (let i = 0; i < line.length; i += 3) {
      points.push(surface(line, i, angle + drift(i / line.length) * 0.16));
    }

    const mid = points[Math.floor(points.length / 2)];
    strokes.push({
      d: toPath(points),
      stroke: k < 2 ? "#EFFFF7" : paint(depth(mid)),
      width: (spine ? between(1.5, 2.3) : between(1.1, 1.8)).toFixed(1),
      opacity: (k < 2 ? between(0.82, 1) : between(0.4, 0.78)).toFixed(2),
    });
  }
}

/*
 * Facets — the edges.
 *
 * Triangles spanning consecutive rings: two points on one ring, one on the next.
 * Every segment is straight and every corner is mitred, which is the one thing
 * the winding lines cannot produce and the reason the figure now reads as cut
 * rather than as wound.
 */
for (const limb of LIMBS) {
  const line = centreline(limb.of, FACET_RINGS * 6);
  const step = Math.floor(line.length / FACET_RINGS);

  for (let ring = 0; ring < FACET_RINGS - 1; ring += 1) {
    const i = ring * step;
    const j = (ring + 1) * step;

    for (let f = 0; f < FACETS_PER_GAP; f += 1) {
      const a1 = between(-Math.PI, Math.PI);
      const a2 = a1 + between(0.5, 1.9) * (rnd() < 0.5 ? 1 : -1);
      const b1 = a1 + between(-0.7, 0.7);

      strokes.push({
        d: toPath([surface(line, i, a1), surface(line, j, b1), surface(line, i, a2)]),
        stroke: paint(depth(line[i])),
        width: between(0.6, 1.3).toFixed(1),
        opacity: between(0.16, 0.52).toFixed(2),
      });
    }
  }
}

/*
 * Runners — the connective tissue.
 *
 * Fewer and tighter than they were. They used to be the whole drawing, and the
 * whole drawing was wool; at this count they read as the lines tying one limb to
 * the next, which is the job they were always actually doing.
 */
for (let n = 0; n < RUNNERS; n += 1) {
  const chain = pickWeighted(CHAINS).of;
  const line = centreline(chain, 128);

  const from = rnd() < 0.78 ? 0 : Math.floor(between(0, line.length * 0.4));
  const to = rnd() < 0.78 ? line.length - 1 : Math.floor(between(line.length * 0.6, line.length));
  if (to - from < 18) continue;

  const around = wobbler();
  const reach = between(0.5, 1.0);
  const drift = between(-0.25, 0.25);

  const points = [];
  for (let i = from; i <= to; i += 3) {
    const t = (i - from) / (to - from);
    points.push(surface(line, i, Math.PI * (reach * around(t * 2.4) + drift)));
  }

  const mid = points[Math.floor(points.length / 2)];
  strokes.push({
    d: toPath(points),
    stroke: paint(depth(mid)),
    width: between(0.7, 1.5).toFixed(1),
    opacity: between(0.22, 0.6).toFixed(2),
  });
}

/*
 * The head — faceted, not a ball of wool.
 *
 * Chords across an ellipse rather than loops around one. The first version drew
 * fifty overlapping circles here, which made the softest thing in the picture
 * sit exactly where a viewer looks first. The true outline goes on last so the
 * head has one hard edge under the facets rather than only an average of them.
 */
{
  const h = JOINTS.head;
  const ring = (a) => ({
    x: h.x + Math.cos(a) * h.r * 0.86,
    y: h.y + Math.sin(a) * h.r * 1.06,
  });

  for (let n = 0; n < HEAD_FACETS; n += 1) {
    const a1 = rnd() * Math.PI * 2;
    const a2 = a1 + between(1.1, 2.6);
    const a3 = a2 + between(0.8, 2.1);
    strokes.push({
      d: toPath([ring(a1), ring(a2), ring(a3)]),
      stroke: n % 5 === 0 ? "#EFFFF7" : paint(between(0, 0.25)),
      width: between(0.7, 1.4).toFixed(1),
      opacity: between(0.24, 0.72).toFixed(2),
    });
  }

  /*
   * The outline, and quietly.
   *
   * At full strength it was the brightest closed shape in the picture and the
   * head stopped being a head — a hard white ellipse on black is a balloon,
   * whatever is drawn inside it. Down here it does its job, which is to give the
   * facets one true edge to average toward.
   */
  const outline = [];
  for (let s = 0; s <= 30; s += 1) outline.push(ring((s / 30) * Math.PI * 2));
  strokes.push({ d: toPath(outline), stroke: "#EFFFF7", width: "1.3", opacity: "0.55" });

  /*
   * Hair, thrown back by the stride.
   *
   * The cheapest and by some distance the strongest cue in the drawing. A
   * silhouette can carry proportion but it cannot carry *motion* at the head,
   * and a figure striding left with nothing happening above the shoulders reads
   * as standing still with her arms out.
   *
   * Each strand leaves the crown, sweeps back opposite the stride, and falls —
   * `t * t` on the drop, so it leaves the head flat and gathers weight as it
   * goes, which is what hair does. They are drawn last and left brighter than
   * the body: this is the one place in the picture the eye should land first.
   */
  for (let n = 0; n < HAIR_STRANDS; n += 1) {
    const root = ring(between(-2.3, -0.5)); // around the crown, back half
    const length = between(80, 190);
    /*
     * More fall than reach.
     *
     * The first attempt threw it almost horizontally at up to 290 units, which
     * put it straight through the raised arm — a bright streak across the one
     * limb the pose depends on, reading as a fault rather than as hair. It goes
     * *down* now and drifts back as it falls, so it stays behind the shoulder
     * where the stride would actually leave it.
     */
    const back = between(0.34, 0.62);
    const lift = between(-16, 8);
    const sway = wobbler();

    const points = [];
    for (let s = 0; s <= 16; s += 1) {
      const t = s / 16;
      points.push({
        x: root.x + length * back * t + sway(t * 1.6) * 12,
        y: root.y + lift * t + length * 1.05 * t * t + sway(t * 2.2) * 8,
      });
    }

    strokes.push({
      d: toPath(points),
      stroke: n % 4 === 0 ? "#EFFFF7" : paint(between(0, 0.3)),
      width: between(0.8, 1.6).toFixed(1),
      opacity: between(0.26, 0.7).toFixed(2),
    });
  }
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="presentation">
<!--
  Godwin Austen Labs — the ascent figure.
  Generated, do not edit by hand: npm run gen:ascent (scripts/generate-ascent-figure.mjs).
  Drawn from a skeleton rather than traced, and original to this repository —
  unlike public/assets/figure.svg, which is a trace (see docs/adr/0004).
  Seed ${SEED}. Colours are baked in, so this is an <img>/background, not a mask.
-->
<g fill="none" stroke-linecap="butt" stroke-linejoin="miter">
${strokes.map((s) => `<path d="${s.d}" stroke="${s.stroke}" stroke-width="${s.width}" opacity="${s.opacity}"/>`).join("\n")}
</g>
</svg>
`;

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, svg, "utf8");
console.log(
  `figure-ascent.svg — ${strokes.length} strokes, ${(svg.length / 1024).toFixed(0)} KB, seed ${SEED}`,
);
