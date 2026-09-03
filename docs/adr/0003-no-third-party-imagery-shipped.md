# 0003 — Generated placeholder artwork instead of shipping the reference images

**Date:** 2026-09-01
**Status:** accepted — amended by [0005](0005-generated-placeholder-film.md),
which adds a generated placeholder _film_ under the same rule

## Context

The build brief ends with: "Once you use the images in site put them accordingly
in the specific public or asset folder … (copy not cut)."

The eleven files in `docs/inspiration/raw/` are two frames of the Mantis site, a
browser screenshot of oddcommon.com, and a set of earlier exploration images. The
same brief also says, of the Mantis artwork specifically, **"Do not trace or
reproduce"** it, and sets aside images 04 and 08–10 as the direction we moved
away from.

So the instruction is conditional — _once you use them_ — and the rest of the
brief is what decides whether that condition is ever met.

## Decision

Ship none of the reference images. Every visual asset on the site is generated
from a seeded script in this repo:

| Asset                               | Generator                          | Regenerate with        |
| ----------------------------------- | ---------------------------------- | ---------------------- |
| `public/assets/scribble-figure.svg` | `scripts/generate-scribble.mjs`    | `npm run gen:scribble` |
| `public/assets/tiles/*.svg`         | `scripts/generate-tile-stills.mjs` | `npm run gen:stills`   |

The reference files stay exactly where the owner put them, unmodified, and are
catalogued in `docs/inspiration/INDEX.md` with how each was read.

## Consequences

**Easier.** Nothing the site serves is someone else's work, so there is no
attribution or licensing question at launch. The artwork is parameterised, so
"denser hand", "longer legs", or a different figure is a number in a script
rather than a new file to source. Both scripts are seeded, so regenerating
produces byte-identical output and the assets do not churn in diffs.

**Harder.** The scribble is 87 KB of path data (≈35 KB gzipped). That is the
single heaviest thing on the page, and it is why the hero paints it as a CSS
mask with a `react-dom` `preload()` rather than inlining it into the HTML.

**Accepted losing.** The tile stills are abstract line-work, not footage. They
are honest placeholders — they do not pretend to be a product shot, which would
make the grid lie about how it will look with real clips in it. Real `.mp4`s drop
in as a one-line `src:` per tile in `src/content/copy/home.ts`.

## Alternatives

- **Copy the reference images into `public/` and use them as tile artwork.**
  Rejected: it would publish other studios' work as ours, and the brief
  explicitly forbids reproducing the Mantis artwork.
- **Stock imagery or AI-generated photos.** Rejected: the design has no
  photography anywhere in it, and inserting some to fill the grid would be
  inventing a visual language the brief did not ask for.
- **Empty grey tiles.** Rejected: the grid's composition cannot be judged — by us
  or by the owner — against four empty rectangles.
