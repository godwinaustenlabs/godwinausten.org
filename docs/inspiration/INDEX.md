# Inspiration index

**Maintained by the agent.** A catalogue of the material in this folder and what
each item was taken to mean. Rebuilt whenever the owner adds references.

Its job is to make interpretation reviewable: if the agent read something as a
decision when it was only a reference, that error is visible here rather than
buried in built code.

## How to read this

- **DECISION** — settled. Build to it. Do not reinterpret.
- **REFERENCE** — direction, not instruction. Informs the brief; open to
  discussion.
- **UNCLEAR** — the agent could not tell. **These are questions for the owner**,
  and nothing is built from them until answered.

## Catalogue

| File                                     | Folder | Read as       | What it was taken to mean                                                                                                                                                            | Feeds                                       |
| ---------------------------------------- | ------ | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| `GODWIN-AUSTEN-LABS-BUILD-PROMPT.md`     | `raw/` | **DECISION**  | The owner's brief for the redesign. Copy, palette, type, section order, and the three breakpoints are settled. Everything else in this table is subordinate to it.                     | `docs/brief.md`, the whole home composition |
| `01-mantis-hero-wide.jpg`                | `raw/` | **REFERENCE** | Hero **composition and typographic confidence only**: huge tight-leading headline overlapping a loose figure, tiny mono nav, small link under the headline, corner meta.               | `hero-scribble`                             |
| `02-mantis-hero-scribble-closeup.jpg`    | `raw/` | **DECISION**  | **Traced directly.** The owner reversed the build prompt's "do not trace" on 2026-09-01. `scripts/trace-figure.mjs` vectorises this file into the hero figure. Licensing is an open launch blocker — see `docs/adr/0004`. | `scripts/trace-figure.mjs`, `hero-scribble` |
| `03-oddcommon-reach-out.png` + the live site | `raw/` | **DECISION** | The layout system, wholesale: fixed bars top and bottom, panels sized to the band between them, content in cells on a one-pixel seam, eyebrow and action bars flush to cell edges. The owner asked for this theme explicitly. | `components/ui/{Panel,Cell}`, every block |
| oddcommon.com — the fabric panel (live site, read 2026-09-03) | — | **DECISION** | Crumpled white cloth with the wordmark raised from *underneath* it, and a saturated blob that follows the cursor: merged lobes while moving, one circle at rest. The owner asked for this specifically and asked to go close to it. Read from the live site in motion, not from a still — the trail does not exist in a screenshot, and the panel is several screens along oddcommon's own horizontal strip rather than on the first screen as it was when `03` was taken. Rebuilt from parameters we control; nothing lifted. | `mark-field/parts/ClothCanvas.tsx` |
| `05-technical-arc-illustration.jpg`      | `raw/` | **REFERENCE** | Optional thin-line motif — concentric arcs, tick rules, small solid data marks. Used for the placeholder stills standing in for real case-study footage.                               | `scripts/generate-tile-stills.mjs`          |
| `07-liminal-brand-board.jpg`             | `raw/` | **REFERENCE** | Corner `+` registration ticks and small mono spec labels as a recurring detail.                                                                                                       | `components/ui/Ticks`, `.tick` in CSS       |
| `11-makemepulse-awards-bubbles.jpg`      | `raw/` | **REFERENCE** | A cluster of wildly varied circles beside big type without becoming a card. Rebuilt as the hero's interactive swarm — circles that drift, scatter from the cursor, and thread together. | `hero-scribble/parts/AgentSwarm.tsx`        |
| `04-precision-split-card.jpg`            | `raw/` | **REFERENCE** | Earlier exploration. The brief says do not use as a layout pattern: card- and stat-block-heavy, the direction we moved away from.                                                     | — (not used)                                |
| `06-brushstroke-mark.jpg`                | `raw/` | **REFERENCE** | A tall vertical brushstroke that swells and tapers, with a counter-arc across it. Rebuilt in SVG as `public/assets/mark.svg`, used as a very faint parallax layer behind the cost section. | `scripts/generate-tile-stills.mjs`, `problem-beats` |
| `08-case-study-carousel.jpg`             | `raw/` | **REFERENCE** | Earlier exploration, explicitly set aside by the brief for the same reason as `04`.                                                                                                  | — (not used)                                |
| `09-problem-solution-circles.jpg`        | `raw/` | **REFERENCE** | Earlier exploration, explicitly set aside by the brief.                                                                                                                              | — (not used)                                |
| `10-droplet-logomark.jpg`                | `raw/` | **REFERENCE** | Earlier exploration, explicitly set aside by the brief.                                                                                                                              | — (not used)                                |

## Unclear — needs the owner

- _(none)_ — `06-brushstroke-mark.jpg` was the last one. The owner's instruction
  on 2026-09-01 to "utilise the assets or rebuild them in SVG" resolved it as a
  REFERENCE; it is now `public/assets/mark.svg`.

## Conflicts

- **Reference imagery vs. what ships.** `01`/`02` are the Mantis site, `03` is a
  screenshot of oddcommon.com, `11` is makemepulse — other studios' work. They
  inform the build but **none of them is copied into `public/`**, and no pixel of
  them appears on the site. Everything visual that ships is generated from
  `scripts/generate-scribble.mjs` and `scripts/generate-tile-stills.mjs`, which
  is also what "rebuild them in SVG" means here: the *gesture* is reproduced from
  parameters we control, not the file.

- **GSAP + Lenis vs. the existing stack.** The build prompt suggests GSAP
  ScrollTrigger and Lenis for the horizontal scroll; `CLAUDE.md` §4.3 requires
  asking before adding a dependency, and the repo already carries `motion`.
  Resolved in favour of a dependency-free engine — see
  `docs/adr/0002-horizontal-scroll-without-gsap.md`.
