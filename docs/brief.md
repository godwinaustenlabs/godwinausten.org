# Brief

**The standing answer to "what are we building and why."** Always current.
Outranks any sprint (`docs/sprints/README.md`).

Synthesised from `docs/inspiration/raw/GODWIN-AUSTEN-LABS-BUILD-PROMPT.md`
(read as a DECISION) and the reference material catalogued in
`docs/inspiration/INDEX.md`.

---

## Positioning

Godwin Austen Labs builds custom AI agents for enterprise sales, support and ops
teams. Pakistan. Est. 2024.

The site it replaces was dark, jargon-heavy and metric-obsessed — "sub-10ms
latency", "agentic infrastructure". The new one reads like a **creative studio**,
not a SaaS pitch deck. A visitor should leave believing these are engineers with
taste who have actually shipped this into real companies, and that talking to
them costs one email rather than a discovery call.

## The one job of the landing page

**Get the visitor to the lead-magnet opt-in.** Everything above it is earning
that email; the VSL below it is the longer version for whoever is still reading.

The order is the argument:

```
hook  →  cost  →  proof  →  mechanism  →  THE ASK  →  the long version  →  contact
hero     01       02        03            04          05                  06
```

The opt-in comes **before** the video, deliberately. By that point the reader has
been shown what the problem costs them, one thing we actually built, and how we
build it — that is the peak of their willingness, and what we ask for is one
field with no call attached. Putting a four-minute video first spends that
willingness on a commitment an order of magnitude larger and loses everyone who
was not ready to give it.

Time-to-first-frame on the VSL is still the metric that matters most for the
section it is in.

## Voice

Confident, a little dry, human. Short sentences. A studio talking about itself.

> Right: _"We're a handful of engineers who got tired of watching good people do
> repetitive work. So we build the software that does it instead."_

> Wrong: _"Our cutting-edge agentic infrastructure leverages robust,
> enterprise-grade orchestration to deliver seamless automation at scale."_

**Banned:** agentic, leverage, seamless, cutting-edge, robust — as _adjectives_,
which is the whole of the offence above. "Agentic AI Systems" is the name of a
service we sell and is exempt by name in the test; "our agentic approach" is not
and never will be. See `docs/adr/0006-agentic-as-a-service-name.md`.
**Banned:** "case study". We call the work **experiences** — the first is _The
Rembrandt Experience_, for faayy.shop.
**Banned:** invented statistics. No "+40% demo bookings" tiles, no metric
blocks, no percentages anywhere on this page. Real case-study numbers go on a
real case-study page. Both bans are enforced by
`tests/unit/content-home.test.ts` and by an e2e check over the rendered page.

All copy lives in `src/content/copy/home.ts`. Editing it never touches layout.

## Visual direction

| Aspect        | Direction                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Reference                                                |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Palette       | Paper `#F6F5F1`, ink `#0E0E0C`, soft `#6E6D66`, hairline `#D8D6CC`. Signal lime `#C6FF3E` **sparingly** — a dot, an active state, a hover underline, and one short rule above a claim. Never behind text, never a page ground; a bar, at most one per cell. **The four service schematics are the one exception** — see below.                                                                                                                                                                                        | build prompt §4                                          |
| Type          | Space Grotesk (display, tight tracking at size), Inter (body), IBM Plex Mono (every eyebrow, nav, caption, index, corner label)                                                                                                                                                                                                                                                                                                                                                                                       | build prompt §4                                          |
| Layout / grid | Full-bleed blocks that touch and overlap. **No cards.** No borders round content, no radius past 8px, no shadows anywhere. Seams, not boxes.                                                                                                                                                                                                                                                                                                                                                                          | `03-oddcommon-reach-out.png`                             |
| Motion feel   | Structural, not decorative. A horizontal filmstrip on wide desktop, parallax on decorative layers only, reveals on entry. Vertical and quiet everywhere else.                                                                                                                                                                                                                                                                                                                                                         | build prompt §5, `01-mantis-hero-wide.jpg`               |
| Imagery       | The traced hero figure (`docs/adr/0004`, an open licensing item) plus **five owner-supplied photographs** in `public/assets/plates/` — light figures on black, placed as full-bleed cells on ink. Abstract line-work still stands in for footage. The original "no photography" rule no longer describes the site at all; provenance for the plates is unrecorded and is tracked in `SECURITY.md` §10. A second, _generated_ wire figure exists in `scripts/generate-ascent-figure.mjs` but is not currently shipped. | `02-mantis-hero-scribble-closeup.jpg`, `docs/adr/0003-…` |

**"How it gets built" carries tone; nothing else does.** The four schematics
are drawn in **metals, not colours** — steel `#546A75`, deep pewter `#5F5D55`,
bronze `#8A7647`, oxidised copper `#7E5042`, and brass `#B08D52` reserved for
the one live core in each drawing, all on a `#3B3A34` structural line. It is a
legend, not decoration: the same tone means the same thing in every drawing,
and structure stays ink. Defined once in `scripts/generate-diagrams.mjs`, which
documents each tone's job.

The morphing lattice in that section's head takes the same set, but as an
**index**: its four stops land where the four offerings do, so it wears the
tone of the card currently on screen and the head reads as part of it. Silver
→ steel → bronze → graphite across the run: light and unformed, then cool, then
warm, then heavy as the last offering lands.

**Variety comes from value and temperature, never from saturation.** A first
pass used a saturated amber / blue / rust / green and it read as poster paint —
four primaries on a paper-and-ink page is a children's book, whatever the
drawing under them says. Nothing in the set now goes much past 40% saturation,
so the schematics read as machined material and the page stays paper and ink.

**And no signal lime inside a drawing.** Every one of those cells already
spends its one lime bar on the rule above the claim; a second lime mark in the
figure beside it breaks the one-per-cell rule and buys nothing. Brass is the
brightest thing in a schematic precisely because it is the only one.

**The card test.** If a change involves a `<div>` with padding, a border and a
shadow holding some text, it is the wrong pattern for this site.

**With one exception, on the owner's call: the postings on `/careers`.** A role
is a thing that appears and is taken down, and the edge-to-edge grid says the
opposite — a panel is architecture. Each posting is a card: inset from the page,
an 8px radius (the brief's own ceiling), and a lime rule with the glow turned
_inward_ so the light lands on the card rather than smudging the paper around it.
There is still no shadow. The exception is confined to those postings and does
not travel. Colour and
imagery bleed across section seams so the page does not read as a stack of
repeated templates.

**The empty-cell test.** A cell is as tall as its panel, so a short paragraph
pinned to its floor leaves two-thirds of a box doing nothing and reads as a
caption adrift. Fill it by **saying more**, not by drawing more: a claim
over the paragraph, set large, is worth more than an illustration of the
paragraph. Then anchor the two together to one edge — a block at the top and a
block at the bottom of a tall cell puts the void in the middle, where it reads
as a fault rather than as space. Filling it with texture for the sake of not
being empty is the failure mode this test exists to catch.

## Motion principles

1. **The frame moves things; blocks do not.** No block attaches a scroll
   listener. `BlockFrame` publishes `--block-progress` (0→1 as the section
   crosses the viewport, on whichever axis is live) and a block's decorative
   layers read it in CSS. See `docs/modules.md`.
2. **The same composition, two axes.** Wide desktop lays the page out as a
   horizontal filmstrip; everything else is an ordinary vertical document. The
   difference is a CSS `strip:` variant, not a fork.
3. **Reduced motion wins over viewport width.** `prefers-reduced-motion` forces
   the vertical fallback even on a 4K display, and the JS transform is never
   installed at all.
4. **Nothing animates in front of the VSL.** An opacity animation over a video
   element is the wrong place to spend a frame.
5. **Pinning is layout, not motion.** `layout.stickyHead` survives
   `prefers-reduced-motion`; parallax does not. A released head would leave rows
   that were designed against it without their anchor. It does **not** survive a
   phone: below 768px nothing pins, because a transform trailing native scroll
   by a frame reads as a shudder, and a stack is what a phone reader expects.
6. **One section is allowed to stop the strip.** "How it gets built" holds
   against the leading edge and runs its three offerings past vertically before
   the page resumes moving left. It is the only place the sideways travel
   pauses, and it earns it: three things being compared want to arrive one at a
   time against a heading that never leaves. A second section doing this would
   make the filmstrip feel broken rather than deliberate.
7. **A route change is never a hard cut.** The outgoing page scrambles away and
   the next unfolds out of the noise — covered _before_ the router commits.

## Pages

| Route          | Purpose                                                                     | Status                 |
| -------------- | --------------------------------------------------------------------------- | ---------------------- |
| `/`            | Landing + VSL funnel. **One scrolling page**, anchor-linked. The filmstrip. | Shipped                |
| `/work`        | The index — a list, not a grid, with `client:` and `services:` per row.     | Shipped                |
| `/work/[slug]` | One experience in full, generated from `src/content/work/experiences.ts`.   | Shipped — one entry    |
| `/about`       | Who we are, the charter, what we offer, how we work.                        | Shipped                |
| `/careers`     | The stance, the board, and the invitation to write anyway.                  | Shipped                |
| `/contact`     | What to send, what happens next, and where to send it.                      | Shipped                |
| `/vsl`         | Not designed. Folder holds a `.gitkeep`.                                    | Not started            |
| `/privacy`     | Not designed. Folder holds a `.gitkeep`.                                    | Required before launch |
| `/terms`       | Not designed. Folder holds a `.gitkeep`.                                    | Required before launch |

The nav rail carries five items: Work, About, Playbook, Careers, Contact.
Playbook is the one anchor among them (`/#playbook`, the lead magnet); the other
four are real routes. This row replaced the original plan of folding everything
into anchors on the home page — the sub-routes are detailed vertical documents
now, and the filmstrip is home-only.

**Careers is its own route, not a row on `/contact`.** It was one address among
three there, which gave the half of the company that is people the same weight
as a footnote about press enquiries and made a job application a routing
decision. The two pages now say one thing each.

## Block inventory

| Block id             | Purpose                                                          | Appears on          |
| -------------------- | ---------------------------------------------------------------- | ------------------- |
| `hero-scribble`      | Hero — headline crossing the traced figure                       | `/`                 |
| `services-rows`      | What we offer — a cell per offering, held head on the strip      | `/`, `/about`       |
| `experience-feature` | Proof — a claim and one experience card                          | `/`                 |
| `figure-plates`      | The breath — three photographs on ink, and one line              | `/`                 |
| `lead-magnet`        | The ask — the opt-in and the download                            | `/`                 |
| `vsl-panel`          | The film, with its own transport                                 | `/`                 |
| `mark-field`         | The overprinted plate, a claim, and an address                   | `/`, `/careers`     |
| `index-list`         | The work index — a list with a record per row                    | `/work`             |
| `charter`            | Who we are — the ambition, explained, with three lit commitments | `/about`            |
| `figure-statement`   | A claim beside the traced figure, mirrored, tilted, overprinted  | `/careers`          |
| `open-roles`         | The board — a posting in full, and a state for an empty one      | `/careers`          |
| `direct-line`        | The address set large, and a second way to reach it              | `/contact`          |
| `page-header`        | The masthead for a sub-route                                     | every sub-route     |
| `prose-sections`     | Numbered prose — the workhorse of the vertical routes            | sub-routes          |
| `about-statement`    | A statement on ink — the seam block                              | `/about`, `/work/*` |
| `contact-footer`     | Contact, the cropped wordmark, the addresses                     | every route         |

## Non-negotiables

- Time-to-first-frame on the VSL is the metric that matters most.
- Every block obeys the frame contract (`docs/modules.md`) — no block sets its
  own page layout, motion, or breakpoint visibility.
- All motion respects `prefers-reduced-motion`.
- No third-party client scripts (`SECURITY.md` §8). Fonts are self-hosted by
  `next/font`; nothing is fetched from Google at runtime.
- No cards. No shadows. No invented statistics.
- Nothing the site serves is anyone else's artwork (`docs/adr/0003-…`).

## Deliberately undecided

- **`docs/inspiration/raw/06-brushstroke-mark.jpg`** is unclassified — the build
  prompt never mentions it. Nothing is built from it. See the _Unclear_ section
  of `docs/inspiration/INDEX.md`.
- **Where lead-magnet submissions go.** The Server Action validates and logs;
  there is no database and adding one to store an email is exactly the
  improvisation `CLAUDE.md` §5 forbids. `deliver()` in
  `src/server/actions/lead-magnet.ts` is the single seam to change.
- **Whether `public/assets/figure.svg` can ship.** It is traced from another
  studio's artwork on the owner's instruction. Licence it, re-trace from an
  image we own, or drop it — see `docs/adr/0004` and `SECURITY.md` §10.
- **Whether the sub-routes should carry their own opt-in.** The funnel is
  reachable only from `/` today, which loses anyone who lands on `/work` from
  search. Adding it there is easy — it is one line in a composition — but it
  weakens the home page's build-up if the ask is everywhere.
- **A second experience.** `/work` is one build described properly. It becomes an
  index the moment there are two, and that is when `/work/[slug]` earns its
  keep.
- **The Rembrandt Experience film.** The section is built for it; the copy module
  takes a `src:` and nothing else moves.
