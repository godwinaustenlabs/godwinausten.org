# 0008 — The integration plates carry the vendors' own marks

**Date:** 2026-09-26
**Status:** accepted — narrows [0003](0003-no-third-party-imagery-shipped.md)
for four files, and for nothing else

## Context

`diagrams/integration.svg` draws four plates — HubSpot, Salesforce, the Meta
Graph API, Slack — wired into a hub. Until now each plate carried its name set
in mono.

The owner's call: a plate reading "HubSpot" is a drawing of a label, and a plate
carrying the sprocket is a drawing of HubSpot. The point of the drawing is that
"custom solutions for SaaS and enterprises" is an abstraction until you see the
four places the work actually lands. Type names them; the marks make them real.

This runs into 0003, whose whole consequence line is "nothing the site serves is
someone else's work, so there is no attribution or licensing question at
launch." 0003 is about **reference artwork** — other studios' compositions,
pulled from `docs/inspiration/raw/`, which the build brief separately forbade
tracing. A vendor's own logo, used to say that we integrate with that vendor, is
a different thing with a different rule attached to it.

## Decision

Carry the real marks, and take them only from the vendor.

- The marks live in `scripts/logos/<slug>.svg` as **build inputs**, not in
  `public/`. `npm run gen:diagrams` inlines whatever is present.
- **This repository never draws a mark.** Approximating a trademark from memory
  produces a wrong mark: it looks amateur exactly where the drawing is trying to
  look real, and misrendering a mark is the one thing every brand guideline
  forbids outright. If there is no file, there is no mark.
- A missing file falls back to the name in type. A clean checkout with an empty
  `scripts/logos/` builds and looks correct, so this never becomes a step
  between a new contributor and a working site.
- Marks are flattened to one tone on the way in. Four brand palettes dropped
  into a metal line drawing read as four stickers, and one-colour is the usage
  each of these vendors explicitly permits.

0003 is otherwise untouched. Every other visual asset on the site is still
generated from a seeded script in this repo, and the reference images in
`docs/inspiration/raw/` still ship nowhere.

## Consequences

**Easier.** The one drawing whose job is to name real systems can name them the
way the reader recognises them. Swapping a system is a file in and a row in
`SYSTEMS`.

**Harder.** The build is no longer purely self-contained: four files come from
outside and have to be refreshed when a vendor restyles. The loader is regex
over arbitrary SVG, so a mark that paints itself through a `<style>` block or a
gradient has to be flattened by hand first — `scripts/logos/README.md` says so.

**The open question this does not close.** Using a vendor's mark to indicate an
integration is ordinary practice, but each of these four publishes brand
guidelines covering clear space, minimum size, and whether the glyph may run
without its wordmark — and we should not imply a partnership or endorsement that
does not exist. Checking that per mark is the owner's call, not this script's.
It is listed as a step in `scripts/logos/README.md`.

## Alternatives

- **Draw approximations of the four marks.** Rejected, and this is the only
  alternative that was ever tempting, because it keeps the build self-contained.
  It produces four subtly wrong logos. A wrong logo is worse than no logo on
  both counts that matter here — it reads as amateur, and it is the exact misuse
  the guidelines exist to prevent.
- **Keep the names in type.** Still the fallback, and still a good drawing. It
  is simply a less concrete one, which is the thing the owner asked to fix.
- **Ship the marks as separate files in `public/` and `<img>` them in.** Rejected:
  the schematic is painted as a single `background-image`, so a plate would need
  four more network round-trips and would flash empty plates on a slow
  connection.
