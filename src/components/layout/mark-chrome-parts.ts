/**
 * Where each part of the chrome mark sits in its file.
 *
 * GENERATED — `npm run gen:chrome-mark`. Do not edit; regenerate.
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
export const MARK_CHROME_ASPECT = 0.604;

export const MARK_CHROME_PARTS: readonly MarkChromePart[] = [
  { src: "/assets/mark-chrome-1.svg", cx: 0.504, cy: 0.362, w: 0.815, h: 0.383 },
  { src: "/assets/mark-chrome-2.svg", cx: 0.419, cy: 0.755, w: 0.66, h: 0.382 },
  { src: "/assets/mark-chrome-3.svg", cx: 0.645, cy: 0.107, w: 0.17, h: 0.106 },
];
