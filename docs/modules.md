# The module system

The site is built from **blocks**. A page is not a component — it is an ordered
list of block instances (a `PageComposition`) handed to `<ModuleRenderer />`.

This is the architectural bet the whole repo is organised around. This document
is the authoring guide.

---

## Why

Because the same section has to appear on the landing page, in a funnel variant,
and on a case study, at different widths, hidden on mobile, and sometimes as an
animated swap rather than a navigation. If a section is a component that a page
imports, every one of those is a fork. If a section is a block that a composition
places, every one of those is data.

The rule that makes it work: **a block never knows where it is.**

---

## Anatomy

```
src/modules/
├── types.ts                  the contract
├── define.ts                 defineBlock() authoring helper
├── registry.ts               the only wiring point
├── runtime/
│   ├── ModuleRenderer.tsx    composition -> DOM (server component)
│   ├── BlockFrame.tsx        the wrapper every block renders inside (client)
│   ├── ScrollStage.tsx       lays a composition out horizontally on wide desktop
│   ├── scroll-engine.ts      the axis-agnostic scroll mechanism (no React)
│   ├── RouteTransition.tsx   per-block exit/entrance on route change
│   ├── SiteLink.tsx          the one link component — anchors and routes
│   ├── CompositionStage.tsx  cross-fade between compositions, no route change
│   ├── compose.ts            reorder / without / only / patch / insertAfter
│   └── visibility.ts         responsive visibility -> Tailwind classes
└── blocks/
    └── <block-name>/
        ├── index.tsx         the component (default export)
        ├── block.config.ts   defineBlock({ id, schema, load, defaults })
        └── parts/            block-private sub-components (never imported outside)
```

---

## The layout system

Everything on this site is a **cell**. Read from oddcommon.com, which is built
almost entirely out of them.

```
Panel  ──  one section, exactly the band between the fixed bars
  └─ grid of cells, separated by a one-pixel seam
       ├─ eyebrow bar   flush to the cell's top edge
       ├─ body          the only free-form area
       └─ action bar    flush to the bottom, accent square at its end
```

Four rules follow, and they are the difference between a page that looks
designed and one that looks assembled:

0. **The hero is outside the grid.** It is the one panel that is a single
   full-bleed image rather than a set of cells — its job is to be arresting, and
   a seam through the middle would undo it. The grid starts at section 01.
1. **On the filmstrip a panel is `--band` tall and does not grow.** There is a fixed bar at the
   top of every page and another at the bottom; a panel occupies exactly what is
   between them. A section with more content than fits shortens its type or
   drops a cell — it does not overflow. Before this rule, sections set
   `min-h-[100svh]` and then added padding on top, so they ran under the nav and
   past the fold. **In vertical flow a panel is content-height** — the band
   exists to stop a section running under the chrome when the page cannot
   scroll to reveal the rest, and forcing every section to a full screen on a
   sub-route only leaves voids under the short ones.
2. **Content lives in a cell.** Every eyebrow on the site sits in the same place
   relative to its box and every headline starts at the same inset. Content
   floating freely inside a section is what reads as "text in random places".
3. **Cells are small and varied.** A panel of three equal boxes reads as a
   table. Large type broken up by little tiles at alternating edges — an ink
   square, a lime one, a clip at thumbnail size — is what catches the eye on the
   way past and what makes consecutive panels read as one page. `TileCell`.
4. **Cells are told apart by the seam, never by a border.** The seam is a 1px
   grid _gap_ over a hairline ground, so it is always exactly one pixel wherever
   the grid reflows, and there is no card anywhere.

Every panel also ends with a `NextCell` naming the section after it. That is the
connective tissue: a reader is never at the foot of a section wondering whether
the page is over, and the running index in each eyebrow says where they are.

`src/components/ui/Panel.tsx` and `src/components/ui/Cell.tsx` (`Cell`,
`MediaCell`, `TileCell`, `NextCell`); the tokens are `--chrome-top`,
`--chrome-bottom`, `--band` and `--seam` in `globals.css`.

## Navigation

One rail, at the foot of every page, carrying every route. The top bar is the
wordmark and a status dot — nothing else. Two rows of links at opposite ends of
the screen is one row too many, and a bar with a single mark in it reads as a
signature rather than as a menu.

## Division of responsibility

| Concern                        | Owner                                | The block must not                    |
| ------------------------------ | ------------------------------------ | ------------------------------------- |
| Horizontal width, page gutters | `BlockFrame` via `layout.width`      | set `mx-auto` / `max-w-*` on its root |
| Vertical rhythm                | `BlockFrame` via `layout.spacing`    | set its own section padding           |
| Filmstrip panel size           | `BlockFrame` via `layout.panel`      | know which scroll mode is running     |
| Pinning part of itself         | `BlockFrame` via `layout.stickyHead` | measure its own position              |
| Reveal, parallax, delay        | `BlockFrame` via `motion`            | attach scroll listeners               |
| Responsive show/hide           | `BlockFrame` via `visibility`        | put `hidden md:block` on its root     |
| Position on the page           | the composition                      | know its neighbours                   |
| Its DOM `id` / permalink       | the composition via `anchor`         | hard-code an id for the nav to target |
| Content                        | validated `props`                    | read a global or fetch its own copy   |

Two things a block _may_ use, because they are published by the frame rather
than reached for: the `--gutter` spacing token (as `px-gutter`) and the
`--block-progress` custom property (see **Motion** below).

A block that obeys this drops into any page at any position. A block that breaks
it is a one-page component wearing a costume.

---

## Writing a block

### 1. The component

```tsx
// src/modules/blocks/hero-vsl/index.tsx
import type { HeroVslProps } from "./block.config";

export default function HeroVsl({ headline, videoKey }: HeroVslProps) {
  return (
    <div className="grid gap-6">
      <h1 className="font-display text-5xl text-ink">{headline}</h1>
      <VideoPlayer src={`/media/${videoKey}`} />
    </div>
  );
}
```

Note what is absent: no `max-w`, no `py-24`, no `motion.div`, no `hidden md:block`.

### 2. The definition

```ts
// src/modules/blocks/hero-vsl/block.config.ts
import { z } from "zod";
import { defineBlock } from "@/modules";

export const heroVslSchema = z.object({
  headline: z.string().min(1),
  videoKey: z.string(),
});

export type HeroVslProps = z.infer<typeof heroVslSchema>;

export const heroVsl = defineBlock({
  id: "hero-vsl",
  displayName: "Hero — VSL",
  schema: heroVslSchema,
  load: () => import("./index"),
  defaults: {
    layout: { width: "full-bleed", spacing: "loose" },
    motion: { reveal: "rise" },
  },
});
```

The schema is not ceremony. `ModuleRenderer` validates props at the boundary, so
a malformed composition fails with a readable error naming the block and the
instance key — instead of a null-reference deep inside a render.

### 3. Register it

```ts
// src/modules/registry.ts
import { heroVsl } from "./blocks/hero-vsl/block.config";

export const blockRegistry = {
  "hero-vsl": heroVsl,
} as const satisfies Record<string, BlockDefinition>;
```

One line. `load` is a dynamic import, so a block nobody places costs nothing in
the bundle.

### 4. Test it

`tests/unit/blocks/hero-vsl.test.tsx` — render it with Testing Library, assert
behaviour. No snapshots of markup.

---

## Composing a page

```tsx
// src/app/page.tsx
import { block, composePage, ModuleRenderer } from "@/modules";

const home = composePage("home", [
  block("hero", "hero-vsl", { headline: "…", videoKey: "vsl/main.mp4" }),
  block(
    "proof",
    "proof-logos",
    { logos },
    {
      visibility: { base: false, md: true }, // desktop only
    },
  ),
  block(
    "cta",
    "cta-band",
    { label: "Book a call" },
    {
      motion: { reveal: "mask", delay: 0.1 },
    },
  ),
]);

export default function HomePage() {
  return (
    <main>
      <ModuleRenderer composition={home} />
    </main>
  );
}
```

That is the whole page file. If a page file grows layout markup, the markup
belongs in a block.

---

## Composition transforms

`compose.ts` exports pure functions over a composition. A funnel variant is a
function of a composition, not a forked component tree — which is why variants
are cheap to add and trivial to unit-test.

```ts
// A/B variant: no social proof, CTA moved above the fold
const variantB = reorder(without(home, "proof"), ["hero", "cta"]);

// Mobile-first funnel: only the essentials
const mobileFunnel = only(home, "hero", "cta");

// Insert a testimonial after the hero
const withProof = insertAfter(home, "hero", block("quote", "testimonial", { … }));

// Hide one block below md without touching the block
const tuned = patch(home, "proof", { visibility: { base: false, md: true } });
```

All of them return a new composition. None mutate. See `tests/unit/compose.test.ts`.

---

## Visibility

`visibility` maps breakpoints to booleans and compiles to Tailwind classes:

```ts
{ base: false, md: true }        // "hidden md:block"
{ base: true, md: false, xl: true }  // "block md:hidden xl:block"
```

**It toggles a class; it does not conditionally render.** The block stays mounted.
That is deliberate: a block revealed by a resize or a composition transition keeps
its video position, form state, and scroll offset. Do not "optimise" this into
`{show && <Block/>}` — you would trade a class change for a remount.

---

## Motion

Set per instance, applied by the frame:

| Field      | Effect                                                                      |
| ---------- | --------------------------------------------------------------------------- |
| `reveal`   | `"fade"` \| `"rise"` \| `"mask"` — plays when the block enters the viewport |
| `parallax` | depth, `0`–`1`. Registers the block with the scroll engine.                 |
| `delay`    | seconds before `reveal` runs                                                |
| `repeat`   | re-run `reveal` on every re-entry, not just the first                       |

`reveal` is `motion`'s `whileInView`, which is `IntersectionObserver`-based and
therefore works unchanged whether the page scrolls down or sideways.

### Parallax, without a scroll listener in the block

`parallax` does not move the section. It registers the section with the scroll
engine, which writes a `--block-progress` custom property onto it every frame:
`0` as its leading edge is about to enter the viewport, `1` once its trailing
edge has left — measured on whichever axis is currently live. The instance's
depth is published alongside it as `--block-depth`.

A block's decorative layers then read those in plain CSS:

```css
transform: translate3d(
  calc((0.5 - var(--block-progress, 0.5)) * var(--block-depth, 0) * 14rem),
  0,
  0
);
```

That is the whole mechanism. The block gets scroll-linked movement with no JS of
its own, the same declaration works on both axes, and the engine does one
batched layout read per frame for every registered block instead of one
subscription each. See `src/modules/blocks/hero-scribble/index.tsx` for a
worked example.

`BlockFrame` checks `useReducedMotion()` and skips both reveal and parallax when
the visitor asked for reduced motion; `globals.css` neutralises transitions under
the same media query. **Any new animation must preserve both.** A funnel that
induces motion sickness does not convert.

### Pinning: `layout.stickyHead`

`position: sticky` is inert inside the filmstrip's transformed track — there is
no scrollport for it to stick to — so pinning is the frame's job too. Set
`stickyHead: true` and offset the element you want pinned by `--block-lead`:

```tsx
// Y in vertical flow, X on the filmstrip. A class, not a runtime branch.
<div className="[transform:translate3d(0,var(--block-lead,0px),0)]
                strip:[transform:translate3d(var(--block-lead,0px),0,0)]">
```

Give the pinned element an opaque ground; content passes _behind_ it, and
without one it reads as a collision rather than as depth. See
`src/modules/blocks/services-rows/`.

Note that pinning is **layout, not motion**: it survives `prefers-reduced-motion`
where parallax does not. Removing it would leave a section head scrolling away
from rows that were designed against it.

---

## Laying a composition out horizontally

On a viewport at least `1200px` wide, and only when the visitor has not asked for
reduced motion, the home page runs as a **filmstrip**: one viewport-tall strip
that the whole composition sits inside, moving sideways as the page scrolls down.

```tsx
<ScrollStage mainId="main" overlay={<SiteChrome … />}>
  <ModuleRenderer composition={home} />
</ScrollStage>
```

Three things are worth knowing about it:

**It is opt-in per route.** `filmstrip` defaults to `false`. Only the home page
passes it: the sub-routes are ordinary vertical documents at every width, because
horizontal travel suits an argument made at our pace and makes a page of
explanation harder to read. Every page still uses the stage — it owns the
`<main>` landmark, anchor conversion, and `--block-progress`.

**It is one composition, not two.** Panel sizing is a `layout.panel` hint —
`"viewport"`, `"content"` or `"wide"` — that `BlockFrame` only emits under the
`strip:` CSS variant. Below the threshold, or under reduced motion, every one of
those rules is inert and the same DOM is an ordinary vertical document. There is
no per-breakpoint branch anywhere in a block or a composition.

**A panel an anchor targets must be exactly one screen wide.** An anchor lands a
panel's leading edge at the viewport's leading edge, so anything further right on
a wider panel is off-screen on arrival. That is fine for a section someone
travels through and fatal for `lead-magnet`, where it put the email field out of
sight.

**It does not hijack the wheel.** A spacer makes the document genuinely tall
enough to produce the required travel; the engine maps `window.scrollY` onto a
transform on the track. The browser's own scrollbar, trackpad momentum, Page
Down, and find-in-page all keep working. See
`docs/adr/0002-horizontal-scroll-without-gsap.md`.

**DOM order is always the reading order.** The horizontal arrangement is purely
visual. `ScrollStage` renders the `<main>` landmark itself so the `overlay`
(site chrome) lands before it for the skip link, and the engine pulls a focused
element into view when tabbing moves past the right edge.

### Links

Use `SiteLink` for everything internal — anchors and routes both:

```tsx
<SiteLink href="#work">See more work</SiteLink>
<SiteLink href="/work">View our work</SiteLink>
<SiteLink href="/#contact">Contact</SiteLink>
```

| `href`             | What happens                                       |
| ------------------ | -------------------------------------------------- |
| `#work`            | the stage scrolls to that section on this page     |
| `/work`            | the fold/unfold transition, then a route change    |
| `/#contact`        | transition to `/`, then the stage finds the anchor |
| `mailto:` / `http` | left entirely alone                                |

Two reasons a bare `<a>` is not enough, one per mechanism. **In-page anchors:**
in filmstrip mode the target lives inside a `position: fixed` track, so there is
nothing for the browser's own anchor scrolling to scroll. **Route changes:** the
transition has to cover the viewport _before_ the router commits, which means
owning the click.

It is still a real `<a href>` in every case — middle-click, ⌘-click, "copy link
address", crawlers, and a JS failure all keep working.

Anything rendered outside `<ScrollStage>` has no stage in context and its
`SiteLink`s fall back to native anchors. That is why the site header goes in via
the `overlay` prop rather than as a sibling.

## Moving between routes

`RouteTransition` (mounted once, in `src/app/layout.tsx`) owns the timing:
cover, push, reveal. What covers is `SiteLoader` — the logomark curtain from the
live godwinausten.org, dropping **down** to cover and **up** to reveal. It runs
on first load too: mounted covering, mark draws, curtain lifts.

The mark is the owner's, lifted verbatim (`src/components/layout/loader-mark.ts`)
and inlined rather than referenced as a file, because the outline writes itself
on with `stroke-dasharray` and that only animates on paths in the document.
Drawing is a CSS animation keyed on the loader's phase, so it replays on every
navigation without a single line of state.

Why the timing has to be owned at all: `AnimatePresence` keyed on the pathname
does not work in the App Router, because the outgoing tree is unmounted as soon
as navigation commits. Covering first and pushing second is the only ordering
that hides the swap.

The reveal is keyed off the **pathname landing**, not a timer, so a
back/forward navigation — which never goes through a link — still lifts the
curtain. Under `prefers-reduced-motion` the curtain is hidden in CSS and the
router is called directly.

Which sections get an id is the **composition's** call, via `anchor`:

```ts
block("work", "work-grid", copy.work, { anchor: "work" });
```

## Switching compositions without navigating

`CompositionStage` cross-fades between whole compositions inside one route — the
"swap the lego set, not the table" case. Use it when the funnel moves from the
VSL step to the booking step and you want to keep the analytics session, scroll
position, and any playing media alive.

```tsx
<CompositionStage activeId={step}>
  {step === "vsl" ? <ModuleRenderer composition={vsl} /> : <ModuleRenderer composition={book} />}
</CompositionStage>
```

Children are rendered on the server and handed in already-built, so this stays
compatible with Server Components.

---

## Boundaries enforced by tooling

- ESLint (`no-restricted-imports`) forbids importing a block's internals from
  outside that block. Go through the registry.
- `composePage` throws on duplicate keys — duplicates silently break React
  identity and motion state.
- `ModuleRenderer` throws in development on an unknown block or invalid props,
  and skips the block in production rather than taking the page down.

---

## Current state

Seven blocks, placed across three routes:

| Block                | `/` | `/work` | `/about` | `/contact` |
| -------------------- | :-: | :-----: | :------: | :--------: |
| `hero-scribble`      |  ●  |         |          |            |
| `experience-feature` |  ●  |         |          |            |
| `index-list`         |     |    ●    |          |            |
| `pillars`            |     |         |    ●     |            |
| `services-rows`      |  ●  |         |    ●     |     ●      |
| `lead-magnet`        |  ●  |         |          |            |
| `vsl-panel`          |  ●  |         |          |            |
| `page-header`        |     |    ●    |    ●     |     ●      |
| `prose-sections`     |     |    ●    |    ●     |     ●      |
| `about-statement`    |     |    ●    |    ●     |            |
| `contact-footer`     |  ●  |    ●    |    ●     |     ●      |

`prose-sections` is the one block allowed to be taller than the band. It only
ever appears on a vertical sub-route, where a reader scrolls at their own pace
and a fixed height would be a cage.

That table is the argument for the whole system. Three sub-routes cost two new
blocks and three content files between them; every other section on them is the
same component the home page uses, placed by a different composition.

Nothing else is registered, on purpose. Blocks are added when a real section is
designed, never as placeholders. See `CLAUDE.md` §2.3 and the block inventory in
`docs/brief.md`.
