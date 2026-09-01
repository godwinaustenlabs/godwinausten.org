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
 * Photography. Downloaded rather than hotlinked — see scripts/fetch-photos.mjs
 * for why, and docs/photo-credits.md for who took them.
 */
export const PHOTO = {
  wireDark: "/assets/photo/wire-dark.jpg",
  wireTangle: "/assets/photo/wire-tangle.jpg",
  fibre: "/assets/photo/fibre.jpg",
  trails: "/assets/photo/trails.jpg",
} as const;

/**
 * The contact footer, identical on every route.
 *
 * A function rather than a constant because `composePage` refuses duplicate
 * keys and a shared object would be the same instance in four compositions —
 * which works today and breaks the moment two of them are ever merged.
 */
export function contactBlock() {
  return block(
    "contact",
    "contact-footer",
    {
      ...siteCopy.contact,
      wordmark: siteCopy.wordmark,
      photo: PHOTO.wireDark,
    },
    { anchor: "contact" },
  );
}
