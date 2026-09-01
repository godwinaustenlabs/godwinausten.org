# Sprint 1 — The home page

**Started:** 2026-09-01
**Status:** active
**Brief:** `docs/brief.md` (rev. as of 2026-09-01)

## Goal

Replace an empty block registry with the full redesigned home page: six blocks,
all real copy, a working lead-magnet opt-in, and a scroll model that runs as a
horizontal filmstrip on wide desktop and as an ordinary vertical document
everywhere else — from the same composition, with no per-breakpoint fork.

## Scope

- [x] Design tokens are the paper/ink/soft/hairline/lime palette, with
      Space Grotesk, Inter and IBM Plex Mono self-hosted by `next/font`.
- [x] All home-page copy lives in one typed module; a copy edit touches no
      layout code.
- [x] The scribble figure is an original generated asset, reproducible from a
      seed, and shipped as a standalone SVG rather than baked into a component.
- [x] Six blocks exist, are registered, and are placed by a composition —
      `src/app/page.tsx` contains no layout markup.
- [x] Wide desktop reads as one horizontal filmstrip; vertical scroll drives it
      through the browser's own scrollbar rather than by hijacking the wheel.
- [x] Tablet and mobile get the same content as a vertical document, with
      reduced motion and a tighter type scale.
- [x] `prefers-reduced-motion` forces the vertical fallback at any width.
- [x] Anchor nav, tab order, and the skip link all work while visual order is
      horizontal.
- [x] The lead-magnet form submits, validates server-side, and confirms in
      place — and works before hydration.
- [x] No card, border-box, shadow, or invented statistic anywhere on the page,
      with the last of those enforced by a test.

### Added mid-sprint (owner, 2026-09-01)

Written here before the work started, per `CLAUDE.md` §7.3.

- [x] `/work` and `/about` are **real routes**, not anchors on the home page.
- [x] Navigating between routes reads as the outgoing page folding away and the
      incoming one unfolding — not a hard cut.
- [x] The What We Do section has a pinned head and parallax; it currently
      scrolls as flat as every other panel.
- [x] The hero figure reacts to the cursor as well as to scroll.
- [x] The hero composition sits closer to
      `docs/inspiration/raw/01-mantis-hero-wide.jpg` — figure centred and
      crossed by the headline, vertical mono rails, corner marks.
- [x] A general refinement pass over the rest of the home page.
- [x] The work showcase runs **one clip at a time at a fixed 16:9**, never a
      mosaic of unequal slots. Added 2026-09-01 after the first pass shipped a
      grid whose slots each gave the footage a different aspect ratio.

### Added mid-sprint, second round (owner, 2026-09-01)

Written before the work started, per `CLAUDE.md` §7.3.

- [x] The scribble figure **reads as a person**. The first two versions were
      short random strokes inside a silhouette, which produced fuzz; it is now
      long continuous strokes that follow body tubes.
- [x] The hero is decluttered — the clock and the eyebrow repeating the wordmark
      are gone — and readable: the headline crosses the torso, not the face.
- [x] The hero carries an **interactive object**: a cursor-reactive swarm.
- [x] The home page is a **story**, ordered as a funnel, with the **lead magnet
      before the VSL**.
- [x] One case study, called an **experience** — The Picasso Experience for
      faayy.shop — laid out asymmetrically rather than description-left /
      media-right.
- [x] Elements **travel across section seams** on parallax.
- [x] The route transition is **specific to the blocks on screen**, not a
      full-viewport pattern.
- [x] `/work`, `/about` and a new `/contact` are **detailed vertical documents**;
      the filmstrip is home-only.
- [x] Assets from `docs/inspiration/raw/` rebuilt as SVG — the brushstroke mark
      (`06`) and the bubble cluster (`11`, as the swarm).

### Added mid-sprint, third round (owner, 2026-09-01)

Written before the work started, per `CLAUDE.md` §7.3. The owner's word was
"full rebuild".

- [x] The hero figure is **traced from the reference image with a real
      converter**, not generated. Three procedural attempts were rejected.
      See `docs/adr/0004` — this reverses the build prompt's "do not trace",
      and it leaves an open licensing question before launch.
- [x] The site follows **one layout theme**: the oddcommon cell grid. Fixed bars
      top and bottom, panels sized to the band between them, content in cells on
      a one-pixel seam. Nothing floats.
- [x] No section runs under the nav or past the fold. Enforced by an e2e test
      that measures every panel against the real bars.
- [x] The hero headline is readable — type and figure are in separate cells
      rather than overlapping.
- [x] The joining ribbon between sections is **deleted**. Continuity is now
      colour carrying across a seam, not a divider bar.
- [x] The "You are already paying for this" section is **deleted** — too much
      copy for one panel, and the funnel reads faster without it.
- [x] The Picasso Experience section is rebuilt on the grid.
- [x] Copy is written to a **panel budget**, with a unit test for the ceilings.

### Added mid-sprint, fourth round (owner, 2026-09-01)

- [x] The hero is **one full-bleed composition**, not a split of two cells —
      the headline crosses the figure as in the reference. The cell grid starts
      at section 01.
- [x] Sections 01–05 are **denser grids of smaller cells**: big type punctuated
      by tiles at alternating edges, in place of a few large boxes.
- [x] The case-study clip is a **small tile**, not half a panel. A large video
      reads as the subject of the section, and it is evidence.
- [x] **Connectivity**: every panel ends with a `NextCell` naming the section
      after it, and the running index appears in every eyebrow.
- [x] `/work` follows oddcommon's index: a **list**, not a grid, with `client:`
      and `services:` on every row.
- [x] `/about` follows oddcommon's `/expertise`: **three pillars** before any
      prose, then numbered principles.
- [x] **All navigation moved to the bottom rail.** The top bar is the wordmark
      and a status dot.
- [x] A panel is band-height on the filmstrip and **content-height in vertical
      flow** — the sub-routes were showing voids under short sections.

### Added mid-sprint, fifth round (owner, 2026-09-01)

- [x] The **loader from the live godwinausten.org** is the site's transition —
      the logomark curtain, dropping down to cover and up to reveal, on load and
      on every navigation. Mark lifted verbatim.
- [x] The Picasso Experience is **a card**, not a section: a claim on the left,
      one card beside it, detail on `/work`.
- [x] The footer wordmark is **always cropped** — sized off the cell rather than
      the viewport, so the bleed does not stop happening at some widths.
- [x] Readability pass on the hero: figure pushed up and right so the headline
      crosses the sparse torso, subhead moved onto clean paper.

### Added mid-sprint, sixth round (owner, 2026-09-01/02)

- [x] Hero: copy and figure **side by side**, no seam between them, swarm gone.
- [x] `/work` is an **index**; each experience opens `/work/[slug]`, generated
      from `src/content/work/experiences.ts`.
- [x] The **loader from the live site** drives loading and navigation.
- [x] The **morphing lattice** from the live site sits above the services
      headline — ported maths, driven by the _pin_ rather than a GSAP timeline,
      so every phase happens while the heading is stuck. Opt-in per placement;
      only the home page shows it.
- [x] Placeholder **demo reels** on the experience card, the `/work` index rows
      and the experience page. Hover-to-play where they sit beside copy.
- [x] Lead magnet reads as an offer: cover, kicker, filled accent button. It
      does **not** pin — pinning needs a panel wider than the screen, which
      pushes the field off the edge on arrival.
- [x] Section 02 pins its headline against a black bar the cells slide behind.
- [x] Scroll jitter on the vertical routes: `overflow-anchor: none` and
      `scroll-behavior: smooth` were global and are now scoped to the filmstrip.
- [x] Nav moved to the bottom rail; "Sales / Service / Ops" removed.
- [x] **No invented timecodes.** The VSL chapter times and the reel runtimes
      were made up; they are numbered and labelled instead. Same rule as the
      no-statistics ban — a number nobody can check is worth less than none.

**Not done:** photography. See the open question below.

**`06-brushstroke-mark.jpg` is no longer UNCLEAR.** The owner's instruction to
"utilise the assets or rebuild them in SVG" resolved it; it is now a REFERENCE,
rebuilt as `public/assets/mark.svg`.

**A rule is being set aside to do this.** `CLAUDE.md` §2.3 says never create a
page until it is explicitly asked for. It has now been explicitly asked for, in
conversation, which is precedence #1 in §7.1 — so `/work` and `/about` get a
`page.tsx`. The rule still holds for `/vsl`, `/contact`, `/privacy`, `/terms`
and `/work/[slug]`, which stay as `.gitkeep`.

## Explicitly out of scope

- **`/work/[slug]`, `/vsl`, `/privacy`, `/terms`.** Still only a `.gitkeep`
  each (`CLAUDE.md` §2.3). `/work`, `/about` and `/contact` were pulled into
  scope above; these were not.
- **A second experience.** `/work` describes one build properly. It becomes an
  index the moment there are two, and that is when `/work/[slug]` earns its
  keep.
- **Persisting lead-magnet submissions.** No database (`CLAUDE.md` §5). The
  action validates and logs; `deliver()` is the seam.
- **Real case-study footage and real numbers.** Placeholders are generated
  line-work, and tiles take a real `.mp4` as a one-line change.
- **A Content-Security-Policy.** Still tracked in `SECURITY.md` as required
  before the custom domain goes live.

## Blocks touched

| Block             | New / changed | Notes                                                                |
| ----------------- | ------------- | -------------------------------------------------------------------- |
| `hero-scribble`   | New           | Headline over the generated figure, painted as a CSS mask            |
| `work-grid`       | New           | Bleeding asymmetric tile grid; tiles take real `.mp4`s later         |
| `services-rows`   | New           | Three full-width rows, hairline rules, lime hover rule               |
| `about-statement` | New           | The only ink panel — the seam that stops the page reading as a stack |
| `vsl-optin`       | New           | VSL placeholder + inline lead magnet; no reveal animation, by design |
| `contact-footer`  | New           | Ink band, cropped wordmark, mailto links, footer nav                 |

Runtime additions, documented in `docs/modules.md`:

| Piece                           | What it adds                                                  |
| ------------------------------- | ------------------------------------------------------------- |
| `runtime/scroll-engine.ts`      | The filmstrip mechanism and `--block-progress` publishing     |
| `runtime/ScrollStage.tsx`       | React binding, the `<main>` landmark, anchor conversion       |
| `runtime/StageLink.tsx`         | An in-page anchor that works on both axes                     |
| `layout.panel` on `BlockLayout` | How a block sizes itself as a filmstrip panel                 |
| `anchor` on `BlockInstance`     | The composition, not the block, decides what gets a permalink |

## Cloudflare resources needed

- [x] none — nothing in this sprint touches a binding.

## Open questions for the owner

- [ ] **Photography (asked for, not built).** Adding Unsplash imagery means
      either hotlinking a third-party origin — which conflicts with
      `SECURITY.md` §8 and complicates the CSP that already blocks launch — or
      downloading the files into `public/` at build time, which is the right
      answer but means committing someone else's photographs and tracking their
      attribution. Given `figure.svg` is already an open licensing item
      (`docs/adr/0004`), I did not want to add a second one without asking.
      **Say the word and I will do the download-at-build-time version with an
      attribution file.**

- [ ] **`docs/inspiration/raw/06-brushstroke-mark.jpg`** is not referenced
      anywhere in the build prompt and is not in its "earlier exploration,
      ignore" list. Nothing has been built from it. Is it a candidate logomark,
      a texture, or a leftover?
- [ ] **Where should lead-magnet submissions actually go?** An email provider, a
      CRM, or does this trigger the data-layer decision in
      `docs/data-layer.md`? Until then they are validated and logged.
- [ ] **Does `/work` need to exist as a route,** or is `#work` on the home page
      enough until there are more than four case studies? Until it is answered,
      the work section's `See more work →` points at `#contact`, which is the
      most honest destination available — but it is not what the label promises.

## Definition of done

- [x] `npm run ci` passes
- [x] `npm run preview` verified in real workerd (not just `next dev`)
- [x] new blocks have unit tests; funnel-critical paths have an e2e test
- [x] docs updated per `CLAUDE.md` §6
- [ ] anything security-relevant reflected in `SECURITY.md` — nothing in this
      sprint changed the security posture; no new third-party origin, no new
      binding, no new secret. The outstanding CSP item is unchanged.

---

## Outcome

_Filled in when the sprint closes, before it moves to `archive/`._

**Shipped:**

**Cut, and why:**

**Carried forward:** (retyped into the next sprint, not linked)

**Surprises / lessons:**
