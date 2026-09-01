/**
 * A raster-to-SVG tracer, in plain Node.
 *
 * Four stages, the same ones potrace uses:
 *
 *   PNG → pixels → binary bitmap → contours → simplified polygons → SVG paths
 *
 * ## Why this is written out rather than installed
 *
 * potrace, ImageMagick and vtracer are all CLI tools that would have to be
 * installed on every machine that builds this repo, and none of them is a
 * dependency npm can pin. The repo's convention is that generated art comes
 * from `scripts/*.mjs` behind an `npm run gen:*`, with no setup step — so the
 * tracer belongs here. It needs nothing but `node:zlib`.
 */

import { inflateSync } from "node:zlib";

/* ------------------------------------------------------------------- PNG */

/**
 * Decode an 8-bit non-interlaced PNG to a grayscale `Uint8Array`.
 *
 * Deliberately narrow: this reads exactly what `sips -s format png` writes, and
 * throws loudly on anything else rather than silently mis-decoding. A general
 * PNG decoder is a library, and we need one caller's worth.
 */
export function decodePng(buffer) {
  const SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];
  for (let i = 0; i < SIGNATURE.length; i += 1) {
    if (buffer[i] !== SIGNATURE[i]) throw new Error("Not a PNG");
  }

  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idat = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      if (data[12] !== 0) throw new Error("Interlaced PNG is not supported");
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }

    offset += 12 + length;
  }

  if (bitDepth !== 8) throw new Error(`Unsupported bit depth ${bitDepth}`);

  const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[colorType];
  if (!channels) throw new Error(`Unsupported colour type ${colorType}`);

  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const pixels = Buffer.alloc(height * stride);

  // Undo the per-scanline filters. Each row is prefixed with its filter type
  // and is predicted from the pixel to its left (`a`) and the row above (`b`).
  for (let y = 0; y < height; y += 1) {
    const filter = raw[y * (stride + 1)];
    const source = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const row = pixels.subarray(y * stride, (y + 1) * stride);
    const prior = y > 0 ? pixels.subarray((y - 1) * stride, y * stride) : null;

    for (let i = 0; i < stride; i += 1) {
      const a = i >= channels ? row[i - channels] : 0;
      const b = prior ? prior[i] : 0;
      const c = prior && i >= channels ? prior[i - channels] : 0;
      const x = source[i];

      switch (filter) {
        case 0:
          row[i] = x;
          break;
        case 1:
          row[i] = (x + a) & 0xff;
          break;
        case 2:
          row[i] = (x + b) & 0xff;
          break;
        case 3:
          row[i] = (x + ((a + b) >> 1)) & 0xff;
          break;
        case 4: {
          // Paeth: pick whichever neighbour the linear predictor is closest to.
          const p = a + b - c;
          const pa = Math.abs(p - a);
          const pb = Math.abs(p - b);
          const pc = Math.abs(p - c);
          row[i] = (x + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 0xff;
          break;
        }
        default:
          throw new Error(`Unknown PNG filter ${filter}`);
      }
    }
  }

  const gray = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i += 1) {
    const p = i * channels;
    if (channels <= 2) gray[i] = pixels[p];
    // Rec. 601 luma. The source is a pencil drawing, so any sane weighting
    // works, but the standard one keeps the threshold meaningful.
    else gray[i] = (pixels[p] * 299 + pixels[p + 1] * 587 + pixels[p + 2] * 114) / 1000;
  }

  return { width, height, gray };
}

/* -------------------------------------------------------------- contours */

/**
 * Marching squares.
 *
 * Every 2x2 neighbourhood becomes a 4-bit case, and each case contributes
 * directed segments along the cell's edge midpoints. Linking the segments
 * head-to-tail yields closed loops — outer boundaries and holes both, wound in
 * opposite directions, which is exactly what `fill-rule: evenodd` needs to
 * render a line drawing with its gaps intact.
 */
const CASES = {
  1: [["L", "B"]],
  2: [["B", "R"]],
  3: [["L", "R"]],
  4: [["R", "T"]],
  5: [
    ["L", "T"],
    ["R", "B"],
  ],
  6: [["B", "T"]],
  7: [["L", "T"]],
  8: [["T", "L"]],
  9: [["T", "B"]],
  10: [
    ["T", "R"],
    ["B", "L"],
  ],
  11: [["T", "R"]],
  12: [["R", "L"]],
  13: [["R", "B"]],
  14: [["B", "L"]],
};

export function traceContours(mask, width, height) {
  const at = (x, y) => (x < 0 || y < 0 || x >= width || y >= height ? 0 : mask[y * width + x]);

  /** Directed edges, keyed by their start point (in half-pixel integers). */
  const next = new Map();
  const key = (x, y) => x * 2 * 100000 + y * 2;

  for (let y = -1; y < height; y += 1) {
    for (let x = -1; x < width; x += 1) {
      const code = (at(x, y) << 3) | (at(x + 1, y) << 2) | (at(x + 1, y + 1) << 1) | at(x, y + 1);
      const segments = CASES[code];
      if (!segments) continue;

      const points = {
        T: [x + 0.5, y],
        R: [x + 1, y + 0.5],
        B: [x + 0.5, y + 1],
        L: [x, y + 0.5],
      };

      for (const [from, to] of segments) {
        const a = points[from];
        const b = points[to];
        next.set(key(a[0], a[1]), { to: b, key: key(b[0], b[1]) });
      }
    }
  }

  const loops = [];
  const seen = new Set();

  for (const [start, edge] of next) {
    if (seen.has(start)) continue;

    const loop = [];
    let cursor = start;
    let step = edge;

    while (step && !seen.has(cursor)) {
      seen.add(cursor);
      loop.push(step.to);
      cursor = step.key;
      step = next.get(cursor);
    }

    if (loop.length > 3) loops.push(loop);
  }

  return loops;
}

/* -------------------------------------------------------------- simplify */

/** Perpendicular distance from `p` to the segment `a`–`b`. */
function distanceToSegment(p, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);

  let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / lengthSquared;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

/**
 * Douglas–Peucker, iterative so a long contour cannot blow the stack.
 *
 * Marching squares emits a vertex every half pixel, most of which sit on a
 * straight run; dropping them is what takes the output from megabytes to
 * kilobytes without changing the shape.
 */
export function simplify(points, epsilon) {
  if (points.length < 3) return points;

  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;

  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [start, end] = stack.pop();
    let furthest = 0;
    let index = -1;

    for (let i = start + 1; i < end; i += 1) {
      const d = distanceToSegment(points[i], points[start], points[end]);
      if (d > furthest) {
        furthest = d;
        index = i;
      }
    }

    if (index !== -1 && furthest > epsilon) {
      keep[index] = 1;
      stack.push([start, index], [index, end]);
    }
  }

  return points.filter((_, i) => keep[i]);
}

/** Shoelace area — used to drop specks the threshold picked up. */
export function area(points) {
  let sum = 0;
  for (let i = 0; i < points.length; i += 1) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    sum += x1 * y2 - x2 * y1;
  }
  return Math.abs(sum) / 2;
}
