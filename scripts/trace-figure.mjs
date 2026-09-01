#!/usr/bin/env node
/**
 * Vectorises the hero figure from the reference photograph.
 *
 * ## Provenance — read this
 *
 * The source is `docs/inspiration/raw/02-mantis-hero-scribble-closeup.jpg`,
 * which is the Mantis studio's artwork. Tracing it was an explicit instruction
 * from the owner (2026-09-01) and it supersedes the original build prompt's
 * "do not trace or reproduce the Mantis artwork". The output is therefore a
 * derivative of someone else's drawing, and is **not** cleared for a public
 * launch on that basis alone — see docs/adr/0004. Replacing the source file is
 * a one-line change to `SOURCE` below and nothing else moves.
 *
 * ## How it works
 *
 * `sips` (macOS built-in) converts the JPEG to a PNG at a working resolution;
 * `scripts/lib/trace.mjs` decodes it, thresholds it to a bitmap, walks the
 * contours with marching squares, and simplifies them. Everything after `sips`
 * is ours and dependency-free — see that file for why.
 *
 *   npm run gen:figure
 *
 * Output: public/assets/figure.svg
 */

import { execFileSync } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { area, decodePng, simplify, traceContours } from "./lib/trace.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = resolve(ROOT, "docs/inspiration/raw/02-mantis-hero-scribble-closeup.jpg");
const OUT_DIR = resolve(ROOT, "public/assets");

/** Working resolution. Higher keeps more of the fine tangle and costs bytes. */
const TRACE_WIDTH = 1500;
/**
 * Luma below this is ink.
 *
 * Tuned by eye against the source. Higher and the dense areas of the drawing
 * flood together — at 168 the hand traces as one solid blob rather than as
 * overlapping strokes, which loses the whole character of it. Lower and the
 * faint strokes over the legs drop out entirely.
 */
const THRESHOLD = Number(process.env.TRACE_THRESHOLD ?? 132);
/** Douglas–Peucker tolerance, in source pixels. */
const EPSILON = 0.62;
/** Contours smaller than this are scanner speckle, not drawing. */
const MIN_AREA = 2.2;

const work = resolve(tmpdir(), `gal-figure-${process.pid}`);
await mkdir(work, { recursive: true });
const png = resolve(work, "source.png");

execFileSync("sips", [
  "-s",
  "format",
  "png",
  "--resampleWidth",
  String(TRACE_WIDTH),
  SOURCE,
  "--out",
  png,
]);

const { width, height, gray } = decodePng(await readFile(png));
await rm(work, { recursive: true, force: true });

const mask = new Uint8Array(width * height);
for (let i = 0; i < gray.length; i += 1) mask[i] = gray[i] < THRESHOLD ? 1 : 0;

const loops = traceContours(mask, width, height)
  .map((loop) => simplify(loop, EPSILON))
  .filter((loop) => loop.length > 3 && area(loop) >= MIN_AREA);

/*
 * Crop to what was actually drawn. The photograph is mostly empty paper, and a
 * viewBox around the ink is what lets the hero position the figure by its own
 * edges rather than by guessing at the margins in the original frame.
 */
let minX = Infinity;
let minY = Infinity;
let maxX = -Infinity;
let maxY = -Infinity;
for (const loop of loops) {
  for (const [x, y] of loop) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
}

const PAD = 8;
minX -= PAD;
minY -= PAD;
maxX += PAD;
maxY += PAD;
const boxWidth = maxX - minX;
const boxHeight = maxY - minY;

function toPath(loop) {
  let d = "";
  for (const [i, [x, y]] of loop.entries()) {
    const px = Math.round((x - minX) * 10) / 10;
    const py = Math.round((y - minY) * 10) / 10;
    d += `${i === 0 ? "M" : "L"}${px} ${py}`;
  }
  return `${d}Z`;
}

const paths = loops.map(toPath).join("");

function document_(paths) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.round(boxWidth)} ${Math.round(boxHeight)}" role="presentation">
<!--
  Godwin Austen Labs — hero figure.
  Generated, do not edit by hand: npm run gen:figure (scripts/trace-figure.mjs).
  Traced from docs/inspiration/raw/02-mantis-hero-scribble-closeup.jpg — see the
  provenance note at the top of that script before shipping this publicly.
  Fills with currentColor so the drawing takes the ink token from its container.
-->
<path fill="currentColor" fill-rule="evenodd" d="${paths}"/>
</svg>
`;
}

await mkdir(OUT_DIR, { recursive: true });

// One path for the whole drawing. `evenodd` over concatenated subpaths is what
// makes the holes inside every loop of the scribble render as holes — and it
// only works if every contour is in the same path, which is why this is a
// single file rather than the depth planes an earlier version tried to cut out
// of it. The trace is one connected shape; there was nothing to cut along.
const svg = document_(paths);
await writeFile(resolve(OUT_DIR, "figure.svg"), svg, "utf8");

console.log(
  `figure.svg — ${loops.length} contours from ${width}x${height}, ${(svg.length / 1024).toFixed(1)} KB`,
);
