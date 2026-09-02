import { block } from "@/modules";
import { siteCopy } from "@/content/copy/site";

/**
 * The handful of things every page composition needs.
 *
 * Not a layout, not a component — just the shared constants and the one block
 * instance that is genuinely identical on every route. A page is still a
 * composition; this only stops four pages each spelling out the same footer.
 */

/** DOM id of the `<main>` landmark. Skip links target it. */
export const MAIN_ID = "main";

/** The traced hero figure. See scripts/trace-figure.mjs. */
export const FIGURE = "/assets/figure.svg";

/** Decorative motif. See scripts/generate-tile-stills.mjs. */
export const ORBIT = "/assets/tiles/orbit.svg";

/**
 * The contact footer, identical on every route.
 *
 * A function rather than a constant because `composePage` refuses duplicate
 * keys and a shared object would be the same instance in four compositions —
 * which works today and breaks the moment two of them are ever merged.
 */
export function contactBlock(options: { index?: string } = {}) {
  return block(
    "contact",
    "contact-footer",
    {
      ...siteCopy.contact,
      /*
       * The running index is per-composition, not per-block.
       *
       * `siteCopy.contact` carries `05` because that is where it lands on the
       * sub-routes. The home page has one more section in front of it, so it
       * needs `06` there — and renaming it in the shared copy would misnumber
       * every other route that renders the same block.
       */
      ...(options.index ? { index: options.index } : {}),
      wordmark: siteCopy.wordmark,
    },
    { anchor: "contact" },
  );
}
