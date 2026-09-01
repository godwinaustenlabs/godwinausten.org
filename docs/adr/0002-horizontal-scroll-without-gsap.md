# 0002 — Horizontal scroll without GSAP or Lenis

**Date:** 2026-09-01
**Status:** accepted

## Context

The redesign brief asks for a desktop experience where the whole home page is
one viewport-tall filmstrip and vertical scroll is translated into horizontal
movement, with parallax on the decorative layers. It suggests **GSAP with
ScrollTrigger** for the pinning and **Lenis** for the smooth-scroll feel, noting
that the implementation is our call as long as it "feels native, not janky".

Three constraints pulled against simply installing them:

1. `CLAUDE.md` §4.3 — a dependency has to be justified against bundle weight on
   a conversion-critical funnel, and asked about before it is added.
2. The repo already ships `motion` (Motion for React) and `CLAUDE.md` §1 names it
   as _the_ motion library. A second animation runtime would mean two scroll
   subscription models in one page.
3. GSAP + ScrollTrigger is ~70 KB min+gzip and Lenis another ~5 KB, all of it on
   the critical path of the page whose one job is to get a visitor to a video.

## Decision

Build the filmstrip in-house, in `src/modules/runtime/scroll-engine.ts`, with no
new dependency.

The mechanism is deliberately not scroll-jacking. A spacer element makes the
document genuinely tall enough to produce the required travel, and the engine
maps `window.scrollY` onto a `translate3d` on the track, smoothed with a
frame-rate-independent lerp. The browser's own scrollbar, trackpad momentum, Page
Down, spacebar, and find-in-page all keep working — the result is simply drawn
sideways.

Parallax rides on the same loop. The engine publishes a `--block-progress`
custom property onto each registered section every frame; blocks read it in plain
CSS. One rAF loop, one batched layout read, no React re-renders, and no block
attaches a scroll listener of its own.

## Consequences

**Easier.** No new bundle weight. One motion story: `motion` owns
enter/exit reveals (which are `IntersectionObserver`-based and work unchanged on
both axes), the engine owns scroll-linked movement. The whole mechanism is
~250 lines and its geometry is pure functions, so `resolveMode`,
`stripGeometry`, and `progressThroughViewport` are unit-tested without a
renderer (`tests/unit/scroll-engine.test.ts`).

**Harder.** Anything GSAP gives away free is now ours to write: the horizontal
anchor-scroll conversion (`ScrollStage.scrollToId`), pulling focused elements
into view when tabbing sideways, and re-measuring after a web font swap. All
three exist and are covered by e2e tests, but a fourth requirement of that kind
is work rather than a config flag.

**Accepted losing.** ScrollTrigger's scrubbed timelines. If a future section
needs a multi-step animation keyed to scroll position — rather than the single
progress value blocks get today — that is the point to revisit this.

## Alternatives

- **GSAP ScrollTrigger + Lenis, as suggested.** Rejected on bundle weight for a
  funnel page, and on running a second animation runtime alongside `motion`.
  Worth reopening if the site later needs scrubbed timelines rather than a
  single progress value.
- **CSS Scroll Snap on a horizontally-scrolling container.** Genuinely native and
  free, but it makes the page a horizontally-scrolling element, so a vertical
  wheel gesture does nothing without a JS bridge — and the vertical fallback
  becomes a different DOM rather than the same one under a different mode.
- **`motion`'s `useScroll` per block.** What `BlockFrame` did before this change.
  It measures the _vertical_ axis and subscribes per component, so it produces no
  movement at all when the page is running sideways, and costs N subscriptions
  and N layout reads per frame.
