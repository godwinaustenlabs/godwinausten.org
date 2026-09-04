#!/usr/bin/env node
/**
 * Renders the logomark as a flat iridescent mark.
 *
 * ## What it is for
 *
 * The lead magnet's second cell used to run the morphing lattice behind the
 * cover. The owner cut it: it was motion for its own sake next to the one
 * control on the page that matters, and a section whose job is to be pressed
 * does not want a second thing moving in it.
 *
 * What replaces it is the brand — the same mark the loader draws and the
 * favicon crops, given a surface. The reference is oddcommon's homepage
 * wordmark: an extruded solid with an iridescent finish and a soft contact
 * shadow, sitting in the panel like an object rather than a graphic.
 *
 * ## Chrome, not an oil slick
 *
 * Theirs runs a full rainbow. Ours cannot: `docs/brief.md` gives this site
 * paper, ink and one accent, and a mark cycling through orange and violet would
 * be the largest area of colour on the page and none of it ours. So the surface
 * is polished metal — a greyscale band structure with the lime woven into it
 * twice, where the oil slick would put its hue shifts. It reads as chromium and
 * it reads as this brand.
 *
 * ## Why a file and not a component
 *
 * It is static. Every ingredient — the extrusion, the gradient stops, the rim —
 * is fixed at generation time, so shipping it as an SVG costs one cached request
 * and no client JavaScript, where a component would cost bytes on a conversion
 * panel for a picture that never changes (`CLAUDE.md` §4.3).
 *
 * Generated from `src/components/layout/loader-mark.ts`, the same single source
 * the loader and the favicon read, so the mark cannot drift between them.
 *
 * ## One file per shape
 *
 * The mark is three shapes, and on the lead magnet each one drifts away from the
 * pointer under its own weight. That needs them separately paintable, so each
 * gets its own file — every one carrying the *whole* mark's viewBox and the same
 * film geometry, so three layers stacked at the same size reassemble into the
 * mark exactly. Nothing in the component has to know how to fit them together.
 *
 * Their centres go into a generated TypeScript module beside the shapes they
 * came from, because the component needs to know where each part sits in order
 * to measure its distance from the pointer, and a number it derived itself could
 * drift from the drawing.
 *
 *   npm run gen:chrome-mark
 *
 * Output: public/assets/mark-chrome-{1,2,3}.svg
 *         src/components/layout/mark-chrome-parts.ts
 */

import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = "src/components/layout/loader-mark.ts";
const OUT_DIR = resolve(ROOT, "public/assets");
const OUT_PARTS = resolve(ROOT, "src/components/layout/mark-chrome-parts.ts");

const module_ = await readFile(resolve(ROOT, SOURCE), "utf8");

// Read the same way `generate-favicon.mjs` does: the shapes are a TypeScript
// literal, not JSON, and the shape of it is fixed by the interface above them.
const shapes = [...module_.matchAll(/d:\s*"([^"]+)",\s*x:\s*(-?[\d.]+),\s*y:\s*(-?[\d.]+)/g)].map(
  ([, d, x, y]) => ({ d, x: Number(x), y: Number(y) }),
);
if (shapes.length === 0) throw new Error(`No LOADER_SHAPES found in ${SOURCE}`);

/**
 * Bounds, per shape and for the mark as a whole.
 *
 * Read off the raw coordinate pairs rather than from a real path parser. The
 * numbers include Bézier control points, which can sit outside the curve they
 * steer — so this is a hair generous. That is the safe direction to be wrong in:
 * a box slightly larger than the ink pads the drawing, where a box slightly
 * smaller would clip it.
 */
function boundsOf(shapeList) {
  const b = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  for (const shape of shapeList) {
    const numbers = shape.d.match(/-?\d*\.?\d+/g)?.map(Number) ?? [];
    for (let i = 0; i + 1 < numbers.length; i += 2) {
      const x = numbers[i] + shape.x;
      const y = numbers[i + 1] + shape.y;
      if (x < b.minX) b.minX = x;
      if (x > b.maxX) b.maxX = x;
      if (y < b.minY) b.minY = y;
      if (y > b.maxY) b.maxY = y;
    }
  }
  return b;
}

const box = boundsOf(shapes);

const markW = box.maxX - box.minX;
const markH = box.maxY - box.minY;

/**
 * Even padding on all four sides, so the mark is centred in its own box.
 *
 * It used to carry an extra allowance on the trailing and bottom edges for the
 * extrusion and the shadow to sit in, which pushed the mark up and to the left
 * inside the file. Painted with `background-size: contain` the box is what gets
 * centred, not the drawing in it, so the mark sat visibly off-centre in its
 * cell. Flat, there is nothing to make room for.
 */
const PAD = markH * 0.06;
const originX = box.minX - PAD;
const originY = box.minY - PAD;
const width = markW + PAD * 2;
const height = markH + PAD * 2;

const r1 = (n) => Math.round(n * 10) / 10;

/** One shape's path data, under the id the mask reaches for. */
const defsFor = (shape) =>
  `<g id="mark"><path transform="translate(${r1(shape.x)} ${r1(shape.y)})" d="${shape.d}"/></g>`;

/*
 * The oil slick.
 *
 * The first version of this was a linear gradient with light and dark bands in
 * it, and it looked like a sticker: straight edges, no depth, nothing happening
 * between the stops. A real iridescent surface has none of those properties —
 * the bands *swirl*, because the film they come from varies in thickness across
 * a curved solid, and the highlights sit on top of that rather than being part
 * of it.
 *
 * Both are things SVG filters do natively and neither needs a 3D engine:
 *
 *   feTurbulence      a smooth random field, the varying film thickness
 *   feDisplacementMap push the gradient around by that field -> the swirl
 *   feSpecularLighting light the same field as a bump map -> the highlights
 *
 * The result is generated once and shipped as a file, so all of it is paid for
 * at build time and none of it on the page.
 */

/**
 * The hues the film cycles through.
 *
 * Anchored on the site's lime and walked outwards — mint, cool blue, warm sand,
 * a muted coral — rather than a full spectrum. That is the same trick the
 * reference uses: its slick reads as "iridescent" while actually living in a
 * narrow band of greens, creams and tans, which is why it sits on a page
 * instead of fighting it.
 */
const FILM = [
  "#ffffff",
  "#c6ff3e",
  "#3f6b1f",
  "#eafff0",
  "#1f5f4a",
  "#cfe4ff",
  "#ffffff",
  "#e9c896",
  "#c2624a",
  "#5e2a24",
  "#f3efe4",
  "#9ee04a",
  "#ffffff",
];

const filmStops = FILM.map(
  (c, i) => `<stop offset="${r1(i / (FILM.length - 1))}" stop-color="${c}"/>`,
).join("");

/** The band spacing, in user units — tight enough to read as a film. */
const BAND = markH * 0.34;

/**
 * One part's file.
 *
 * Every part carries the whole mark's viewBox and the identical film — the same
 * gradient in the same user space, the same rect under the same filter, so the
 * turbulence lands in the same places. Only the mask changes. Stack the three at
 * one size and the mark reassembles with no seam, because none of them ever knew
 * it had been cut up.
 */
const partSvg = (
  shape,
) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r1(originX)} ${r1(originY)} ${r1(width)} ${r1(height)}" fill="none" role="presentation">
<!-- Godwin Austen Labs - one part of the logomark. Generated: npm run gen:chrome-mark -->
<defs>
  ${defsFor(shape)}

  <!--
    A mask, not a clipPath.

    clipPath only accepts shapes and uses *of* shapes; a use pointing at a group
    is not valid there, and the browser resolves it to an empty clip rather than
    complaining — so the face silently vanished and left an empty outline. A mask
    takes arbitrary content, including this group.
  -->
  <mask id="markMask" maskUnits="userSpaceOnUse"
    x="${r1(originX)}" y="${r1(originY)}" width="${r1(width)}" height="${r1(height)}">
    <use href="#mark" fill="#ffffff"/>
  </mask>

  <!-- The film, repeating across the mark on a diagonal. -->
  <linearGradient id="film" gradientUnits="userSpaceOnUse" spreadMethod="repeat"
    x1="${r1(box.minX)}" y1="${r1(box.minY)}"
    x2="${r1(box.minX + BAND * 0.75)}" y2="${r1(box.minY + BAND)}">${filmStops}</linearGradient>

  <!--
    Swirl the film, then light it.

    The displacement scale is what separates "wavy stripes" from "poured oil":
    below about a tenth of the mark it reads as a wobble, and far above it the
    bands tear. The specular pass runs off the same noise, so the highlights sit
    where the surface actually curves rather than being sprinkled on.

    The filter region is a percentage of the *rect's* box, and that rect is
    identical in all three files — which is what keeps one part's swirl continuous
    with the next one's.
  -->
  <filter id="slick" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
    <!--
      The frequency is the whole effect and it is easy to get wrong by an order
      of magnitude. At one over the mark's height the field is nearly constant
      across the shape, every pixel displaces by the same amount, and the bands
      come out perfectly straight — a striped sticker. It wants a wavelength of
      roughly a fifth of the mark, so the swirl turns several times inside it.
    -->
    <feTurbulence type="fractalNoise" baseFrequency="${(1 / (markH * 0.19)).toFixed(5)} ${(1 / (markH * 0.27)).toFixed(5)}"
      numOctaves="4" seed="11" result="noise"/>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="${r1(markH * 0.3)}"
      xChannelSelector="R" yChannelSelector="G" result="swirl"/>

    <feGaussianBlur in="noise" stdDeviation="${r1(markH * 0.012)}" result="bump"/>
    <feSpecularLighting in="bump" surfaceScale="${r1(markH * 0.06)}" specularConstant="1.6"
      specularExponent="18" lighting-color="#ffffff" result="spec">
      <feDistantLight azimuth="238" elevation="55"/>
    </feSpecularLighting>
    <feComposite in="spec" in2="swirl" operator="in" result="specClipped"/>
    <feBlend in="swirl" in2="specClipped" mode="screen" result="lit"/>

    <!-- A broad sweep of sheen across the whole solid, so it reads as one form. -->
    <feGaussianBlur in="lit" stdDeviation="${r1(markH * 0.004)}"/>
  </filter>

</defs>

<!-- The face: the film, swirled and lit, cut to this part. -->
<g mask="url(#markMask)">
  <rect x="${r1(originX - markW)}" y="${r1(originY - markH)}" width="${r1(width + markW * 2)}" height="${r1(height + markH * 2)}"
    fill="url(#film)" filter="url(#slick)"/>
</g>

<!--
  The silhouette, drawn.

  The film is anchored on white, which was free while the mark sat on an ink
  cell: the light bands were the highlights. On paper they are the *background*,
  and the shape dissolved into it at its edges — the mark read as a smudge of
  colour rather than as a mark. A hairline gives it back its outline, in the same
  ink and at the same weight as every rule on the site.
-->
<use href="#mark" fill="none" stroke="#0e0e0c" stroke-width="${r1(markH * 0.005)}" stroke-opacity="0.72"/>

</svg>
`;

const r3 = (n) => Math.round(n * 1000) / 1000;

const written = [];
for (const [i, shape] of shapes.entries()) {
  const file = `mark-chrome-${i + 1}.svg`;
  const svg = partSvg(shape);
  await writeFile(resolve(OUT_DIR, file), svg, "utf8");

  const b = boundsOf([shape]);
  written.push({
    file,
    bytes: svg.length,
    // Where this part's middle sits inside the *whole* file's box, as a
    // fraction of it. The component multiplies these by however large the mark
    // has been painted; nothing downstream has to know the user units.
    cx: r3(((b.minX + b.maxX) / 2 - originX) / width),
    cy: r3(((b.minY + b.maxY) / 2 - originY) / height),
    // The part's own size, in the same fractions. It is what sets how far each
    // one is allowed to travel: a dot the size of a full stop should not swing
    // as far as the shape it sits on.
    w: r3((b.maxX - b.minX) / width),
    h: r3((b.maxY - b.minY) / height),
  });
}

const parts = `/**
 * Where each part of the chrome mark sits in its file.
 *
 * GENERATED — \`npm run gen:chrome-mark\`. Do not edit; regenerate.
 *
 * The three SVGs beside this all carry the same box, so stacking them at one
 * size reassembles the mark. What a component cannot see from that is where any
 * individual part *is*, which is what it needs in order to work out how far the
 * pointer is from it. These are those positions, as fractions of the painted
 * mark, so they hold at whatever size it ends up.
 */

export interface MarkChromePart {
  /** The file to paint, from the site root. */
  readonly src: string;
  /** The part's centre, as a fraction of the painted mark's width and height. */
  readonly cx: number;
  readonly cy: number;
  /** The part's own extent, in the same fractions. */
  readonly w: number;
  readonly h: number;
}

/** The painted mark's aspect ratio, for fitting it inside a box. */
export const MARK_CHROME_ASPECT = ${r3(width / height)};

export const MARK_CHROME_PARTS: readonly MarkChromePart[] = [
${written
  .map((p) => `  { src: "/assets/${p.file}", cx: ${p.cx}, cy: ${p.cy}, w: ${p.w}, h: ${p.h} },`)
  .join("\n")}
];
`;

await writeFile(OUT_PARTS, parts, "utf8");

for (const part of written) {
  process.stdout.write(`${part.file} — ${(part.bytes / 1024).toFixed(1)} KB\n`);
}
process.stdout.write(`mark-chrome-parts.ts — ${written.length} parts\n`);
