#!/usr/bin/env node
/**
 * Builds the favicon from the loader's path data.
 *
 * The tab icon and the loading curtain are the same mark, so they are generated
 * from one source: `src/components/layout/loader-mark.ts`. Maintaining the mark
 * in two places is how a site ends up with a tab icon one revision behind.
 *
 * Next serves `src/app/icon.svg` as the favicon automatically — no <link> tag
 * and no `public/` entry needed.
 *
 *   npm run gen:favicon
 */

import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = "src/components/layout/loader-mark.ts";

const module_ = await readFile(resolve(ROOT, SOURCE), "utf8");

const viewBox = module_.match(/LOADER_VIEWBOX = "([^"]+)"/)?.[1];
if (!viewBox) throw new Error(`No LOADER_VIEWBOX in ${SOURCE}`);

// The shapes are a TypeScript literal, not JSON, so they are read with a
// pattern rather than parsed. The shape of the literal is fixed by the
// LoaderShape interface directly above it in the same file.
const shapes = [...module_.matchAll(/d:\s*"([^"]+)",\s*x:\s*(-?[\d.]+),\s*y:\s*(-?[\d.]+)/g)].map(
  ([, d, x, y]) => ({ d, x: Number(x), y: Number(y) }),
);

if (shapes.length === 0) throw new Error(`No LOADER_SHAPES found in ${SOURCE}`);

// Every command in the mark is M/C/Z, all absolute, all coordinate pairs — so
// alternating numbers give the points, and a bounding box comes out of them.
// Control points bulge a little past the true outline; the padding covers it.
const box = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
for (const shape of shapes) {
  const numbers = shape.d.match(/-?\d*\.?\d+/g)?.map(Number) ?? [];
  for (let i = 0; i + 1 < numbers.length; i += 2) {
    const x = numbers[i] + shape.x;
    const y = numbers[i + 1] + shape.y;
    if (x < box.minX) box.minX = x;
    if (x > box.maxX) box.maxX = x;
    if (y < box.minY) box.minY = y;
    if (y > box.maxY) box.maxY = y;
  }
}

// The mark sits off-centre inside the loader's 2000x2000 stage, which is right
// on a full-screen curtain and wrong in a 16px tab. Crop square to the mark.
const PAD = 0.09;
const size = Math.max(box.maxX - box.minX, box.maxY - box.minY) * (1 + PAD * 2);
const originX = (box.minX + box.maxX) / 2 - size / 2;
const originY = (box.minY + box.maxY) / 2 - size / 2;

const paths = shapes
  .map((shape) => `<path transform="translate(${shape.x} ${shape.y})" d="${shape.d}"/>`)
  .join("");

// Paper ground rather than transparency: tab strips are light grey in light mode
// and near-black in dark, and an ink mark vanishes into the second one.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${originX.toFixed(2)} ${originY.toFixed(2)} ${size.toFixed(2)} ${size.toFixed(2)}" role="img" aria-label="Godwin Austen Labs">
<!--
  The logomark, as the browser-tab icon.
  Generated from ${SOURCE} by scripts/generate-favicon.mjs.
  Do not hand-edit \u2014 run \`npm run gen:favicon\`.
-->
<rect x="${originX.toFixed(2)}" y="${originY.toFixed(2)}" width="${size.toFixed(2)}" height="${size.toFixed(2)}" fill="#f6f5f1"/>
<g fill="#0e0e0c">${paths}</g>
</svg>
`;

await writeFile(resolve(ROOT, "src/app/icon.svg"), svg, "utf8");
console.log(
  `src/app/icon.svg \u2014 ${shapes.length} shapes, ${(svg.length / 1024).toFixed(1)} KB, viewBox ${size.toFixed(0)}\u00b2 (stage is ${viewBox.split(" ")[2]}\u00b2)`,
);
