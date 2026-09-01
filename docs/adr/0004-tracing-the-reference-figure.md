# 0004 — Tracing the reference figure, and what that means for launch

**Date:** 2026-09-01
**Status:** accepted — **with an open licensing question, see Consequences**

## Context

The hero needs a tangled line drawing of a reaching figure. Three attempts at
generating an original one procedurally (`scripts/generate-scribble.mjs`, now
deleted) produced, in order: uniform fuzz, a legible figure made of visible
sine-wave coils, and a better figure that still read as generated rather than
drawn. The owner's verdict on the third was "not at all like what we want", with
the instruction: **use an actual SVG converter to turn the actual image into
SVG.**

The "actual image" is `docs/inspiration/raw/02-mantis-hero-scribble-closeup.jpg`
— the Mantis studio's artwork.

This reverses an instruction in the owner's own original build prompt, which
said of that file: _"Do not trace or reproduce the Mantis artwork itself. Build
an original scribble-tangle illustration."_ `CLAUDE.md` §7.1 puts the owner's
instruction in the current conversation above everything else, so the current
one wins.

Separately, no tracer was available: `potrace`, ImageMagick, `vtracer` and
Inkscape are all absent from the machine, and none of them is a dependency npm
can pin.

## Decision

Trace it, with a tracer written into the repo.

`scripts/lib/trace.mjs` does PNG decode (via `node:zlib`), thresholding,
marching-squares contour extraction and Douglas–Peucker simplification.
`scripts/trace-figure.mjs` drives it: macOS `sips` converts the JPEG to PNG at a
working resolution, the library traces it, and the result is cropped to the ink
and written as one path with `fill-rule: evenodd`.

Output is a single `public/assets/figure.svg`. The hero paints it twice, at
slightly different scales and rates, to get depth.

## Consequences

**Easier.** The figure is now the drawing the owner wanted, because it _is_ that
drawing. Regenerating is `npm run gen:figure` with no install step, on any
machine, and the two knobs that matter — threshold and simplification tolerance
— are named constants with the reasoning next to them.

**Harder.** 171 KB of path data (≈56 KB gzipped) for one asset. It is painted as
a CSS mask rather than inlined so it stays off the critical path and gets
cached, but it is the single heaviest thing on the site.

**Accepted losing.** Depth planes. An earlier cut split the trace into three
files by position so they could move at different rates; it could not work,
because `fill-rule: evenodd` renders the holes inside every loop of the scribble
by cancelling them against the contour that encloses them, and that only holds
when they are in the same path. Split up, the hand filled in as a solid blob.
The trace is one connected shape and there was nothing to cut along. Two layers
of the same cached file cost one fetch and render correctly.

**The open item.** `public/assets/figure.svg` is a derivative of another
studio's artwork. That is a deliberate, instructed choice and it is fine for
development, but it is **not cleared for a public launch on that basis alone**.
Before the site goes live on the custom domain, one of these has to be true:

- the artwork is licensed or permission is given, or
- the source is replaced with an image we own — a one-line change to `SOURCE` in
  `scripts/trace-figure.mjs`, since everything downstream is parameterised, or
- the figure is dropped from the hero.

Tracked in `SECURITY.md` §10 alongside the other launch blockers.

## Alternatives

- **Keep generating it.** Rejected by the owner after three attempts. The gap is
  real: a procedural scribble can be _made_ to look like a figure, but the
  reference has the hesitations and corrections of a hand, and those are not
  parameters.
- **`brew install potrace` and shell out.** Better tracer, worse repo: every
  machine that builds the site would need a tool npm cannot install or pin, and
  the failure mode is a broken build with a confusing error. The tracer here is
  ~200 lines and does the one job needed.
- **Trace at a lower threshold for a lighter file.** Tried at 168 and 150. At
  168 the dense areas flood together and the hand becomes a solid blob; 132 is
  the point where it still reads as overlapping strokes.
