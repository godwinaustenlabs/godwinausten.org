#!/usr/bin/env node
/**
 * Generates the placeholder stills that sit behind the work-grid video tiles.
 *
 * These are stand-ins for real case-study footage. They are deliberately
 * abstract line-work rather than stock imagery or fake UI screenshots: the point
 * of the grid is composition and rhythm, and a placeholder that pretends to be a
 * product shot makes the layout lie about how it will look with real footage.
 *
 * The motif — thin concentric arcs, tick rules, a few solid marks — is read from
 * docs/inspiration/raw/05-technical-arc-illustration.jpg (REFERENCE, see
 * docs/inspiration/INDEX.md). Each tile gets a different seed, so the four read
 * as a family without repeating.
 *
 * They are used as CSS backgrounds, not as `<video poster>`: browsers do not
 * reliably rasterise SVG posters. A tile shows its still until a real `src` is
 * added to the copy module, at which point the video paints over it.
 *
 * Each file is transparent line-work only. The tile paints its own ground and
 * scales the motif, which is what lets the same still sit in a tall slot and a
 * wide one without the arc cropping to an unreadable fragment.
 *
 *   npm run gen:stills
 *
 * Output: public/assets/tiles/*.svg and public/assets/mark.svg
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = resolve(ROOT, "public/assets/tiles");
const ROOT_ASSETS = resolve(ROOT, "public/assets");

const W = 800;
const H = 800;

/*
 * A single mid-tone that reads on both the light and the ink tiles. The stills
 * are used as CSS *background images*, so they cannot inherit `currentColor` —
 * one tone that survives both grounds is cheaper than shipping two variants of
 * every file.
 */
const LINE = "#9e9b8f";

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

/**
 * A ring of tick marks around an ellipse — the signature of the reference. The
 * ticks only occupy `sweep` radians so the ring reads as an arc caught
 * mid-rotation rather than a closed dial.
 */
function tickRing(random, cx, cy, rx, ry, count, start, sweep, len) {
  const marks = [];
  for (let i = 0; i < count; i += 1) {
    const t = start + (i / count) * sweep;
    const x = cx + Math.cos(t) * rx;
    const y = cy + Math.sin(t) * ry;
    const l = len * (0.55 + random() * 0.9);
    const nx = Math.cos(t) * l;
    const ny = Math.sin(t) * l;
    marks.push(`M${r1(x)} ${r1(y)}L${r1(x + nx)} ${r1(y + ny)}`);
  }
  return marks.join("");
}

function ellipse(cx, cy, rx, ry) {
  return (
    `M${r1(cx - rx)} ${r1(cy)}` +
    `a${r1(rx)} ${r1(ry)} 0 1 0 ${r1(rx * 2)} 0` +
    `a${r1(rx)} ${r1(ry)} 0 1 0 ${r1(-rx * 2)} 0`
  );
}

function still(seed, label) {
  const random = rng(seed);

  const cx = W * 0.5;
  const cy = H * 0.5;
  const rx = W * (0.2 + random() * 0.08);
  const ry = rx * (1.15 + random() * 0.45);
  const rotate = r1(random() * 40 - 20);

  const start = random() * Math.PI * 2;
  const sweep = Math.PI * (0.9 + random() * 0.9);

  // A handful of solid blocks riding the arc — the reference's "data marks".
  const blocks = [];
  for (let i = 0; i < 5 + Math.floor(random() * 4); i += 1) {
    const t = start + random() * sweep;
    const x = cx + Math.cos(t) * rx * (0.86 + random() * 0.2);
    const y = cy + Math.sin(t) * ry * (0.86 + random() * 0.2);
    const w = 4 + random() * 16;
    const h = 4 + random() * 10;
    blocks.push(
      `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" ` +
        `transform="rotate(${r1((t * 180) / Math.PI)} ${r1(x)} ${r1(y)})"/>`,
    );
  }

  /*
   * No background rect: the tile supplies its own ground colour and scales the
   * motif with `background-size`, so one file works on a tall tile and a wide
   * one without the arc being cropped to an unreadable fragment.
   */
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" fill="none" role="presentation">
<!-- Godwin Austen Labs — placeholder still "${label}". Generated: npm run gen:stills -->
<g transform="rotate(${rotate} ${r1(cx)} ${r1(cy)})" stroke="${LINE}" fill="none">
  <path d="${ellipse(cx, cy, rx, ry)}" stroke-width="1.2" opacity="0.7"/>
  <path d="${ellipse(cx, cy, rx * 0.88, ry * 0.9)}" stroke-width="0.9" opacity="0.45"/>
  <path d="${tickRing(random, cx, cy, rx * 1.06, ry * 1.04, 96, start, sweep, 26)}" stroke-width="1.6" opacity="0.75" stroke-linecap="butt"/>
  <path d="${tickRing(random, cx, cy, rx * 0.72, ry * 0.76, 34, start + 0.6, sweep * 0.5, 12)}" stroke-width="1.1" opacity="0.4" stroke-linecap="butt"/>
  <g opacity="0.9" fill="${LINE}" stroke="none">${blocks.join("")}</g>
</g>
</svg>
`;
}

const TILES = [
  ["picasso", 0x1f31],
  ["outbound", 0x2c07],
  ["support", 0x3b55],
  ["voice", 0x47a9],
];

await mkdir(OUT_DIR, { recursive: true });

for (const [name, seed] of TILES) {
  const svg = still(seed, name);
  await writeFile(resolve(OUT_DIR, `${name}.svg`), svg, "utf8");
  console.log(`${name}.svg — ${(svg.length / 1024).toFixed(1)} KB`);
}

/*
 * The brushstroke mark.
 *
 * Rebuilt in SVG from docs/inspiration/raw/06-brushstroke-mark.jpg (REFERENCE):
 * a tall vertical stroke that swells in the middle and tapers to nothing at both
 * ends, with a thin counter-arc cutting across it. The reference is a photograph
 * of ink on paper; this is the same gesture described as two filled paths, so it
 * scales, takes the ink token, and weighs a couple of kilobytes.
 *
 * Used as a large, very faint parallax layer behind a section — the one piece of
 * pure mark-making on the site.
 */
{
  const cx = W / 2;
  const top = H * 0.04;
  const bottom = H * 0.96;
  const belly = W * 0.3;

  // The main stroke: a lens shape, fat at the middle, drawn as two mirrored
  // quadratics so both ends come to a point.
  const blade =
    `M${r1(cx)} ${r1(top)}` +
    `C${r1(cx + belly * 0.5)} ${r1(H * 0.3)} ${r1(cx + belly)} ${r1(H * 0.42)} ${r1(cx + belly * 0.62)} ${r1(H * 0.55)}` +
    `C${r1(cx + belly * 0.35)} ${r1(H * 0.72)} ${r1(cx + belly * 0.2)} ${r1(H * 0.86)} ${r1(cx)} ${r1(bottom)}` +
    `C${r1(cx - belly * 0.16)} ${r1(H * 0.84)} ${r1(cx - belly * 0.3)} ${r1(H * 0.62)} ${r1(cx - belly * 0.14)} ${r1(H * 0.42)}` +
    `C${r1(cx - belly * 0.06)} ${r1(H * 0.28)} ${r1(cx - belly * 0.02)} ${r1(H * 0.14)} ${r1(cx)} ${r1(top)}Z`;

  // The counter-arc that cuts across it, left of centre.
  const counter =
    `M${r1(cx - belly * 0.1)} ${r1(H * 0.42)}` +
    `C${r1(cx - belly * 0.75)} ${r1(H * 0.46)} ${r1(cx - belly * 0.75)} ${r1(H * 0.6)} ${r1(cx - belly * 0.06)} ${r1(H * 0.62)}` +
    `C${r1(cx - belly * 0.62)} ${r1(H * 0.59)} ${r1(cx - belly * 0.62)} ${r1(H * 0.47)} ${r1(cx - belly * 0.1)} ${r1(H * 0.42)}Z`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" fill="none" role="presentation">
<!-- Godwin Austen Labs — brushstroke mark. Generated: npm run gen:stills -->
<g fill="currentColor">
  <path d="${blade}"/>
  <path d="${counter}" opacity="0.55"/>
</g>
</svg>
`;
  await writeFile(resolve(ROOT_ASSETS, "mark.svg"), svg, "utf8");
  console.log(`mark.svg — ${(svg.length / 1024).toFixed(1)} KB`);
}

/*
 * One larger, sparser arc for use as a decorative parallax layer behind a
 * section rather than inside a tile. Same motif, dialled down: it has to sit
 * under headline-sized type without competing with it.
 */
{
  const random = rng(0x7e44);
  const cx = W * 0.5;
  const cy = H * 0.5;
  const rx = W * 0.42;
  const ry = rx * 1.05;
  const start = random() * Math.PI * 2;
  const sweep = Math.PI * 1.7;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" fill="none" role="presentation">
<!-- Godwin Austen Labs — decorative orbit. Generated: npm run gen:stills -->
<g transform="rotate(-14 ${r1(cx)} ${r1(cy)})" stroke="${LINE}" fill="none">
  <path d="${ellipse(cx, cy, rx, ry)}" stroke-width="1" opacity="0.5"/>
  <path d="${ellipse(cx, cy, rx * 0.8, ry * 0.84)}" stroke-width="0.75" opacity="0.3"/>
  <path d="${tickRing(random, cx, cy, rx * 1.05, ry * 1.04, 120, start, sweep, 20)}" stroke-width="1.2" opacity="0.45" stroke-linecap="butt"/>
</g>
</svg>
`;
  await writeFile(resolve(OUT_DIR, "orbit.svg"), svg, "utf8");
  console.log(`orbit.svg — ${(svg.length / 1024).toFixed(1)} KB`);
}
