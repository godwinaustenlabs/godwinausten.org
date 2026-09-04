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

### Added mid-sprint, seventh round (owner, 2026-09-02)

- [x] **The three "How it gets built" cells state a claim.** They were a
      three-line paragraph on the floor of a panel-tall box. Each now leads with
      a short bold position — "We watch before we build.", "Many small agents,
      not one big one.", "Nothing new to log into." — over a lime rule, with the
      detail under it. `title` still names the category in the eyebrow; the
      claim is what makes someone read the rest.
- [x] **Lime enters a third place.** One rule per claim, the same `h-1.5 w-10`
      bar as the lead-magnet cover. Sets aside the brief's "one dot, one active
      state, a hover underline" reading of _sparingly_ — see below.
- [x] **Nothing pins below 768px.** The pinned head was a transform running a
      frame behind native scroll, which shuddered on a phone. `--block-lead` is
      now a flat `0px` under `PIN_MIN_WIDTH` and the section reads as a stack.
- [x] **Mobile layout bug in `services-rows`.** The pinned head asked for
      `col-span-2` at every width; below `md` the grid has one explicit column,
      so it grew an unsized implicit one and every cell after it flowed into the
      pair — two cramped columns and a strip of bare ground down the right of
      every phone. Now `col-span-full`.

### Added mid-sprint, eighth round (owner, 2026-09-02)

- [x] **"How it gets built" holds the strip.** On the filmstrip the section now
      parks against the leading edge and its three offerings rise past
      vertically; when the third lands, the page resumes moving left. New engine
      primitive `--block-hold` (the pin's travel as 0→1) drives the stack —
      `--block-lead` is a length and CSS cannot divide one length by another.
- [x] **Schematics are back, above the claim.** `mapping`, `swarm`,
      `integration` fill the slack over each claim, which is what makes the cell
      a composition rather than text with air over it. Held, the cell is a
      window most of a screen wide, so claim and schematic lay out side by side.
- [x] **`/about`: Build and Tune get line-work backdrops.** `wire-tangle.jpg`
      works behind `Map` because at 14% it stops being a photograph and reads as
      pale scribble. `fibre.jpg` (teal starburst) and `trails.jpg` (pastel
      rainbow) never could — they are colour fields in a paper/ink/lime palette.
      Replaced with `diagrams/build.svg` (a braced lattice: the tangle resolved)
      and `diagrams/tune.svg` (many passes converging on one). The three now
      read as one sentence: tangle → lattice → settled signal.

**The rotating disc: argued against, built anyway, then rejected.** I argued
the brief forbade it — "No cards. No borders round content, no radius past 8px,
no shadows anywhere. Seams, not boxes." The owner overruled that (precedence #1,
`CLAUDE.md` §7.1) and asked to see it, with the brief left untouched pending
approval. It was built: seats positioned (never rotated) on a 123vw arc, 15°
apart, with a drawn rim. Shown, and **not approved.** The vertical hold is what
ships, and `docs/brief.md` never changed — so nothing in the docs was left
describing a design that does not exist.

**An approach that was built and then dropped.** The first attempt filled the
cells with generated schematics — a traced process, three clusters handing off,
a hub wired to four systems (`scripts/generate-service-diagrams.mjs`). It worked
and it looked right, but the owner's call was that a cell that size should carry
a **claim**, not an illustration. They were removed for a round and then
restored in the eighth, once the claim gave them something to sit above rather
than compete with: `scripts/generate-diagrams.mjs` now draws both those three
and the two `/about` backdrops.

**A rule is being set aside.** `docs/brief.md` reads the lime accent as "one
dot, one active state, a hover underline. Never a fill." Three rules in one
section is more lime than that sentence allows. The owner asked for colour here
explicitly (precedence #1, `CLAUDE.md` §7.1). The rule is not deleted: the fill
is still a bar and not a background, there is still no lime behind text, and the
budget is one per cell — but the brief's wording now understates what ships, and
the visual-direction row has been updated to match.

### Added mid-sprint, ninth round (owner, 2026-09-02)

- [x] **Media comes out of R2, addressed by id.** `GET /api/media/[id]` streams
      the bucket through an allowlist (`src/server/media.ts`), with byte-range
      support so a scrubber can actually seek. The owner uploads to the key named
      in that table and the site serves it on the next request — no deploy, no
      code change. Documented in `SECURITY.md` §5a.
- [x] **The lead magnet is a button, then one question, then the file.** Loud CTA
      → email → the download starts. Built on `<details>`, so it works with the
      JS still in flight. A generated stand-in PDF
      (`npm run gen:placeholder-pdf`) is served until the real guide is uploaded,
      streamed through the same handler so the placeholder and the real thing are
      indistinguishable to the browser.
- [x] **The VSL frame plays on hover and opens into a theatre.** Muted inline
      loop; click dims the page and opens a dialog with play/pause, ±5s, a
      scrubber, elapsed time and sound. Portalled to `<body>` — `position: fixed`
      inside the filmstrip's transformed track resolves against the _track_, so
      the dialog opened underneath the site's own chrome.
- [x] **`mark-field`, after the VSL.** The logomark pressed into the page, lit
      lime under the cursor. The light is anchored in **viewport** space, not to
      the panel: on the filmstrip the drawing is the half that usually moves, so
      easing in element coordinates (and listening only for `pointermove`) left
      the light glued to the mark and riding along with it whenever the page
      scrolled under a still hand. Both inputs now feed one screen point, and an
      e2e test parks the cursor and scrolls 400px to prove it stays there.
      The surface is **lit cloth with the mark pressed into it**, drawn by one
      fragment shader in raw WebGL: no library, no mesh, no texture download.
      The height field is a few octaves of stretched value noise minus the
      mark's blurred silhouette; everything else is Blinn-Phong with a fixed key
      light for the folds and a second light at the cursor. Because the lime
      arrives as a _light_ rather than a fill, it takes the fold shading with it.
      The mark's rectangle is derived from the panel's aspect at draw time — a
      hard-coded UV rect squashed a 801x1453 logo into a near-square box, because
      UV is normalised per axis. It renders at 0.65x and upscales: everything it
      draws is low-frequency, so the difference is invisible and it is roughly
      half the fragments. It redraws only while something is happening, and the
      GL context is built lazily on first layout — the block is `stripOnly`, and
      a hidden element still mounts, so every phone was paying for a context,
      a shader compile and a rasterised mark it would never show.
- [x] **"How it gets built" splits 30/70 on the strip.** The pinned head and its
      lattice take 30%, the offerings 70% — the offerings had been sharing the
      panel almost evenly with a heading, which left them cramped and pushed the
      schematics against the right edge.
- [x] **The schematics are legible.** Darker tone (`#46443e`, from the stills'
      `#9e9b8f` — past `--color-soft`, short of ink) and roughly double the
      stroke weight. The weights are the real
      fix: stroke widths are in **viewBox units** and these render at about half
      scale in their cell, so a 1.5-unit line was a 0.75px line on screen —
      present but not readable, which is the worst of both. The figure box also
      gained inset padding so the outermost strokes never sit against the seam.
- [x] **Copy: who we are, not what the repository contains.** The section used to
      say "nothing on this page is stock" — true, inward-looking, and no use to a
      reader two panels from the contact form. It now says what the company is
      like. The VSL's hand-off and the anchor were renamed to `#who` to match.
- [x] **Contact footer: the photograph behind the wordmark is gone.** It was
      doing one job — lifting the ink ground to a charcoal — so the cell now
      carries that tone directly. Dropping the photo without it left a hole
      punched in the page.

**Four surfaces were built before this one.** A soft radial glow on the bare
logomark (a coloured smudge); SVG-filtered satin with the mark embossed (right
idea, wrong medium — the emboss was static, so it read as wallpaper); a contact
sheet of every generated drawing (honest, and dull). The shader is the fourth,
and it is the first one where the _light_ is real rather than painted: the
surface responds because it is being lit, not because a mask is being moved
across it.

**What oddcommon actually ships, measured.** Their fabric is a WebGL2 PBR cloth
— a `.glb` mesh with a 784 KB normal map, a roughness map and a noise map, one
of four WebGL canvases on the page, inside ~2.7 MB of media and 135 KB of
script. It is superb and it is not lightweight; it only feels that way because
it is smooth. The technique was worth copying and the asset list was not:
`CLAUDE.md` §4.3 makes bundle weight a business metric here, and a 3D engine is
a dependency decision for the owner, not one a decorative section makes for
them. A height field is a function — this one costs about 6 KB of source and
downloads nothing.

**The reference used a floating yellow blob.** On this palette that would be the
largest area of accent on the site by an order of magnitude. Revealing _the mark_
in lime instead keeps the accent inside a shape the brand already owns, and makes
the interaction about the thing the page is signed with.

### Added mid-sprint, tenth round (owner, 2026-09-03)

- [x] **`page-header`: the photograph was invisible and the headline sat on a
      grey slab.** The layer was `absolute inset-0 -z-10` at panel level — behind
      the panel's _own_ background, which `grid-cells` paints hairline because
      the seams are gaps over a coloured ground. So every header rendered as a
      page-wide grey rectangle with type on it. The photograph now lives inside
      the cell, over paper and under the type, at 6% rather than 13%: once it
      was actually visible it turned out to be high-contrast enough that the
      printing on the cable was legible behind the headline.
- [x] **`page-header`: the meta row stopped inventing a third cell.** It was
      `md:grid-cols-3` against a list that is two items long on every route, so
      each page had an empty rectangle of seam-ground in the top corner that read
      as something failing to load. Columns now come from the item count.
- [x] **The `/about` pillars stopped competing.** Fully desaturated (the wire
      photograph was still visibly red and blue at `grayscale-[0.4]`, on a page
      whose palette is paper, ink and one lime) and knocked back — 9% on paper,
      16% on ink. The `tune` backdrop dropped from twenty converging passes to
      twelve; behind a word, twenty read as a smear rather than as a signal
      settling.

### Added mid-sprint, eleventh round (owner, 2026-09-03)

- [x] **The case-study clip was zero pixels tall on a phone.** `flex-1`
      distributes _free space_, and a panel whose height comes from its content
      has none to give — so in vertical flow the video box collapsed and the
      experience card simply had no picture. `aspect-video` in flow, `flex-1` on
      the strip: each mode gets the rule that suits it, because `aspect-video` on
      the strip claims its height first and pushes the notes off a panel that
      cannot grow.
- [x] **The placeholder reel plays on touch.** It was gated on `group-hover`,
      which is a gate that never opens on a phone — the reel held its first frame
      forever and read as a broken player. `pointer-coarse` runs it
      unconditionally.
- [x] **Hand-off cells are hidden below `md`.** They earn their place on the
      filmstrip, where the next section is off-screen sideways; on a phone the
      next section is simply the next thing you scroll to, and the row is
      clutter between two blocks of reading.
- [x] **The lattice is hidden below `md`.** It is driven by the pin, and
      `--block-lead` is a flat 0 under `PIN_MIN_WIDTH`, so on a phone it rendered
      one frozen frame. `display: none` also parks its `IntersectionObserver`.
- [x] **The logomark rendered differently on different screens.** The shader's
      finite-difference step was `1.4 / uRes` — one-and-a-bit _device_ pixels —
      which makes the whole surface resolution-dependent: a low-resolution render
      averages the bevel flat, a HiDPI one samples it sharply. The same page
      showed a solid pressed mark on one screen and a faint outline on another.
      The step is now a fixed distance in aspect-corrected uv, so the same shape
      is sampled everywhere. Verified identical at 1x and 2x DPR and across
      aspect ratios.
- [x] **"Lahore" is "Pakistan" throughout.** `site.city` was also renamed to
      `place`: it had no consumers, and a country in a field called `city` is a
      trap for whoever uses it next. `docs/inspiration/raw/` still says Lahore —
      that is the owner's folder (`CLAUDE.md` §7.2) and agents do not edit it.

### Added mid-sprint, twelfth round (owner, 2026-09-03)

> "Change the copy of VSL … use smh more catchy in which we says that we're
> gonna explain you or convince you, also the 4 blocks under VSL … totally
> remove them and make sure the video is working like put an actual placeholder
> video and make sure it's controls actually works in the video player"

- [x] **The VSL headline names what the section is for.** "Watch us replace a
      hiring plan" described a case study the film does not promise; it is now
      "The part where we convince you" — which is what the panel is, sitting
      after the ask with "The long version" over it. The body absorbed the one
      thing the chapter tiles were carrying: what we left to a human.
- [x] **The four chapter cells under the film are gone.** An index of a film
      nobody has watched is a second thing to scan on a panel whose only job is
      to get the film played. `covers` is out of the copy module, the block
      schema and `FilmFrame` — the last of which had no other consumer, so the
      prop went with it.
- [x] **There is a real film in the slot.** `npm run gen:placeholder-video`
      draws a 20-second stand-in and encodes it to H.264 with the `MediaRecorder`
      inside Playwright's Chromium — an encoder already installed for the e2e
      suite, so no ffmpeg and no new dependency. It ships as
      `MEDIA_ASSETS.vsl.fallback`, the real cut still takes over the moment
      `vsl/main.mp4` lands in R2, and nothing on the site is sourced from
      anywhere (`docs/adr/0005`, amending `0003`).
- [x] **The transport works, and is now tested.** Three things were wrong and
      all three were invisible while the panel had nothing to play:
      `mediaSrc()` withheld the `src` whenever R2 was empty, ignoring the
      stand-in the route would have served, so the player stayed disabled in
      front of a file it already had; `/api/media/[id]` ignored `Range` on the
      fallback path while advertising `Accept-Ranges`, and a player that cannot
      request a byte range cannot seek; and the scrubber's hit target was the
      four pixels of the hairline it draws — visually right, not grabbable. The
      track is now painted as a centred background inside a 1.5rem control, with
      the played portion in `--color-signal`. Two e2e tests drive play, pause,
      ±5s and a click-to-seek on both projects.

### Added mid-sprint, thirteenth round (owner, 2026-09-03)

> "See oddcommon.com how they are wrapping their cloth and putting a logo
> underneath it which looks real and a trail of blob that follows, copy that as
> much as you want go close to it"

The reference was read from the live site rather than from a still: the fabric
panel sits several screens along oddcommon's own horizontal strip, and the trail
only exists while the pointer is moving, so it was captured in motion and at
rest. `docs/inspiration/INDEX.md` records what changed since it was last read.
Nothing was lifted — the gesture is rebuilt from parameters we control, which is
the rule `docs/adr/0003` already sets for this reference.

- [x] **The mark is under the cloth, not pressed into it.** It is _added_ to the
      height field now, through a `smoothstep` that squares the blurred
      silhouette into a flat top with a defined shoulder, with the folds damped
      across that top and a little fabric gathering at the edge. Raised and
      pressed are lit from opposite sides; the brief is an object lying under a
      sheet. The texture blur came down from 4.5% to 2.6% to give the shoulder
      an edge to have.
- [x] **The surface reads as fabric.** Two noise fields stretched hard along
      different axes, nudged by a third — anisotropy is what makes a fold a fold
      rather than a lump, and a warp strong enough to be seen turns the whole
      panel into weather. A ridged octave puts the sharp valleys in, weighted by
      a low-frequency field so the crumple gathers in places instead of
      corrugating the panel evenly.
- [x] **A blob that follows the cursor and collapses when it stops.** A chain of
      followers, unioned in the shader as capsules between consecutive links. It
      is a tint rather than a light, so the folds run through it and it reads as
      painted on. Capsules rather than smooth-minimum'd circles: `smin` pulls its
      result below both inputs, so fourteen of them stacked up and a chain
      sitting still rendered as a swollen lobed shape instead of one circle.
- [x] **The panel no longer renders while nobody can see it.** It is one of seven
      on the filmstrip and off screen most of the time, and every scroll woke it,
      so the most expensive surface on the site was drawing continuously behind
      whatever the visitor was actually reading. Tracking still runs off screen —
      the blob is anchored in the viewport and a frozen chain would be wrong on
      arrival — but drawing is gated on being on screen, under a ceiling on
      fragments per frame.
- [x] **The chain eases against the clock.** A fixed fraction per frame is a
      different animation at every frame rate: the same settle took 300ms at
      sixty frames a second and four seconds at five, so the blob dragged worst
      on the hardware least able to hide it. Half-lives now, derived per frame
      from the elapsed time. This is also what was making the mark-field e2e test
      fail in a parallel run — it was measuring a real lag, not flaking.
- [x] **`sin` is out of the noise hash.** Four transcendentals per noise sample,
      dozens of samples per pixel, three height taps: affordable at two-thirds
      resolution with three flat octaves, and not affordable at full resolution
      with drapery. The arithmetic hash is indistinguishable in the output.

### Added mid-sprint, fourteenth round (owner, 2026-09-03)

- [x] **The trail stretches when the panel moves, not only when the cursor
      does.** The chain was eased in viewport coordinates, so a filmstrip panel
      sliding under a motionless hand left the blob a circle even though it was
      visibly travelling across the fabric. The pointer stays a screen position —
      it has to, because no event fires while the page scrolls — but the chain is
      panel-local now, and `tick` converts between the two once a frame. The
      panel's own motion is a change in the target, so the links fall behind it
      exactly as they do under a moving cursor. The blob is painted on the cloth,
      and the cloth is what it lags against.
- [x] **The accent mark on "We have shipped this" is an apostrophe.** A ball with
      a tail, drawn as one path. The straight form was tried first and reads as a
      droplet: with no letters either side to give it a baseline, a round cap
      tapering to a point is just a shape. The tail is what makes it punctuation.
- [x] **The case-study reel plays the stand-in film too.** `reel-picasso` had no
      `fallback` and sat on the drawn `PlaceholderReel`. It points at the same
      generated file the VSL uses — one film covers every empty slot, since it
      says it is a placeholder across every frame and a second cut would only be
      another half-megabyte. Renamed `vsl-placeholder.mp4` to
      `film-placeholder.mp4` to stop the name lying about its scope.
- [x] **The about masthead loses its eyebrow and its meta row.** "Who we are"
      restated the headline more quietly, and "Pakistan / Est. 2024" was a bar of
      facts above a page that says both things properly further down. `eyebrow`
      is optional on `page-header` now; `meta` already defaulted to empty.
- [x] **The about page loses two more small bars.** The "next — how we work"
      hand-off (it earns its row on the filmstrip, where the next section is off
      screen sideways, and is clutter on a document you simply scroll) and the
      "Pakistan — since 2024" line under the closing statement. Both fields are
      optional on their blocks rather than deleted, because `/work/[slug]` still
      uses the statement's.
- [x] **"Three ways we plug in." is centred in its cell.** Without the lattice
      there is nothing above the headline to hold it down, so bottom-aligning it
      left the cell top-heavy with empty paper.

### Added mid-sprint, fifteenth round (owner, 2026-09-03)

> "The picasso placeholder video should be synced across all pages where it
> belongs not just home, this should be done so whenever I want to change the
> video I only change one in public folder and it changes everywhere"

- [x] **One media id, resolved the same way on every page.** There were two
      mechanisms: the home page hard-coded `mediaSrc("reel-picasso")`, while
      `/work` and `/work/[slug]` read an optional `experience.src` that nothing
      ever set. So the film played on one page out of three and there were two
      places to change it. The experience now declares `media: "reel-picasso"` —
      an id, not a URL — and all three routes resolve it through `mediaSrc()`.
      `/work` composes in a function for it, the same reason the home page
      already did.
- [x] **One `Reel`, shared.** `ExperienceVideo` lived inside `experience-feature`
      and was the only reel that actually played: `page-header` and `index-list`
      each had a hand-rolled `<video preload="none">` with nothing to start it.
      Those branches had never run, so supplying a `src` would have turned two
      placeholders into black rectangles — the exact failure a placeholder is
      for. It is `src/components/ui/Reel.tsx` now, plays on visibility, and all
      three blocks use it.
- [x] **The reel is the row on `/work`.** It was a 15rem thumbnail in a
      four-column row — index, thumbnail, copy, record — which made the one thing
      with a moving picture in it the smallest thing on the page. It takes 55% of
      the row now and holds a true 16:9 at every width (52% of a 1440 screen,
      53% of 1920, 90% of a phone). The record moved under the copy to pay for
      it: three columns of text beside a wide frame is not a layout, it is two
      columns of text and a gutter.
- [x] **A stand-in file per asset, not one shared.** `reel-picasso` pointed at
      the VSL's film. Sharing saved 300 KB and quietly coupled the slots:
      dropping a real reel over it would have replaced the film as well. The
      generator writes one file per asset now, and a unit test asserts no two
      entries in `MEDIA_ASSETS` name the same file — the `fallback` column only
      means something if replacing one asset changes one asset.

### Added mid-sprint, sixteenth round (owner, 2026-09-04)

- [x] **The hero figure is whole on a phone, and sits on the headline.** Two
      faults reading as one. The mask box is 8% taller than its column and
      anchored to the floor — a bleed that works beside the copy and, stacked
      above it, clipped the raised hand against the top of the hero. And
      `contain` on a column wider than the drawing's near-square aspect fits by
      width, leaving a band of empty paper beneath it. Narrow now uses
      `auto 100%`, which fills the column's height so nothing is clipped and the
      drawing meets the copy; wide keeps `contain` and the bleed unchanged.
      Measured: the figure's box is exactly its column at 390 and 360, and still
      overflows by 8% at 1440.
- [x] **The hero copy is top-aligned below `md`.** Beside the drawing its free
      space splits above and below and reads as margin. Stacked, half of it lands
      _between_ the drawing and the headline and reads as a hole — the gap the
      figure's clipped edge was being blamed for. The gap from the figure to the
      headline is 25px at 390 and 19px at 360; the slack now falls to the foot of
      the hero, where a page is expected to have some.

### Added mid-sprint, seventeenth round (owner, 2026-09-04)

> "don't just mention our process but add our services over there … full Agentic
> AI systems, Micro Agents/ Bots for particular task automation, AI powered
> pipelines and custom solutions for SaaS and enterprises … change the design of
> Free Guide Lead magnet, use eco morph and frosted glass techniques, use less
> text and visible CTA and after clicking download button the email fetcher form
> should appear as a pop up window"

- [x] **The services section lists services.** It was the process — watch,
      then build, then wire up — which is the same thing `/about`'s "How we work"
      already says at length. Four offerings now, on the home page and on
      `/about`: agentic systems, micro agents, pipelines, custom for SaaS and
      enterprise. Two new schematics (`micro`, `pipeline`) join the two that
      still fit.
- [x] **Nothing counts to three by hand any more.** The block had `repeat(3, …)`
      for its columns and a `-200%` strip travel, both correct for exactly three
      cells: a fourth flowed into an implicit column at `md`, and on the strip
      the stack moved two windows out of three so the last offering never
      arrived. Both come from `rows.length` now.
- [x] **The morph has four states, one per card.** The network phase was in the
      owner's original and was cut when this sat beside three cards. Four cards,
      four stops at even thirds, and each shape lands as the offering it belongs
      to does. `STOPS` carries the rule in a comment: one state per card, or the
      lattice finishes early and reads as a stutter.
- [x] **"Agentic" is allowed as a service name and still banned as an
      adjective.** The brief bans the word and a test enforces it; the owner
      named a service with it. The test strips an exact-string `NAMES` allowlist
      before applying the ban, so "Agentic AI Systems" passes and "our agentic
      approach" still fails — `docs/adr/0006`.
- [x] **The lead magnet is an offer, not a section.** Kicker, headline, one line,
      one loud control: the three-bullet contents list went, because it answered
      a question nobody asks of something free. The cover is frosted glass with
      the same morph running behind it — on the viewport driver, since this panel
      does not pin and the pin driver would hold frame one forever.
- [x] **The field arrives as a dialog, and the file starts on submit.** Portalled
      to `<body>`, because `position: fixed` inside the filmstrip's transformed
      track resolves against the track. The native `<details>` is kept as the
      pre-hydration path, so the offer is never a dead button on the slow phone
      the brief says most conversions come from; `useSyncExternalStore` picks
      between them without writing state from an effect.

### Added mid-sprint, eighteenth round (owner, 2026-09-04)

- [x] **The card headings are the owner's words, not a paraphrase of them.**
      "Custom for SaaS & Enterprise" and the rest were tightened-up versions of
      four service names the owner had already written out. They are now what was
      said: Full Agentic AI Systems, Micro Agents / Bots for Particular Task
      Automation, AI Powered Pipelines, Custom Solutions for SaaS and
      Enterprises. The section is headed **"What we offer."** rather than "Four
      ways we plug in", which was a phrase about us where a label was wanted.
- [x] **The eyebrow bars sit on one line.** The titles wrap to one, two and three
      lines, and each bar was only as tall as its own — so the body copy started
      at four different heights and the columns did not line up. A minimum height
      from `md` puts every seam and every first line on the same baseline.
- [x] **`/about` gives each service its own section.** Four columns of small
      print under mono captions made the services the least prominent thing on
      the page that exists to describe them. A `display` variant on the block
      switches it: `"columns"` stays the home page's summary, glanced at in
      sequence while the strip travels; `"sections"` gives each offering the full
      width, a heading in display type, the paragraph at a readable measure and
      its schematic beside it. Same four services, four times the room.
- [x] **Every video is displayed at 16:9, on every page.** Two cells are not
      16:9 and cannot be: the filmstrip's case-study card is band-height (an
      `aspect-video` there claims its height first and pushes the notes off a
      panel that cannot grow — the bug fixed in an earlier round), and the VSL
      media cell fills a `1fr` grid row at `md`. `object-cover` was therefore
      slicing the sides or the top off the picture in both. It is `object-contain`
      now, so the frame is never cropped or stretched anywhere; the ink ground
      absorbs the letterbox, which on an ink panel is invisible. The masthead
      slot on `/work/[slug]` was `21/9` — a cinema crop over footage not shot
      that way — and is `aspect-video` like the rest. Measured across six
      page/viewport pairs: painted ratio 1.78 in every one.
- [x] **`micro.svg` is cropped to its drawing.** `contain` fits the whole
      viewBox, so a third of blank canvas above and below was blank space the
      browser reproduced faithfully and the schematic rendered two thirds the
      size its box allowed.

### Added mid-sprint, nineteenth round (owner, 2026-09-04)

- [x] **The service name is the big heading — the right heading this time.** The
      previous round changed the mono eyebrows and left the display type saying
      "A system, not an assistant." and three more like it. Those `claim` lines
      are gone: the offering's name is the heading, set in display type, with the
      index beside it, on the home page and on `/about`. The eyebrow bar went
      with them — it was repeating in 11px what the heading says in 40 — which
      also retires the bar-height fix the wrapping titles had needed.
- [x] **"What we offer." is not a footer.** `justify-between` with a `flex-1`
      lattice above it pinned the headline to the floor of a band-height panel,
      where a line of display type across the foot of the page reads as a rule
      rather than a title. The lattice takes a bounded share of the column now
      and the pair sits together: the headline lands 40% down, level with the
      offering beside it. On `/about` the headline is top-aligned in its cell for
      the same reason.
- [x] **Every video is a 16:9 _box_, not just a 16:9 picture.** The previous
      round stopped the cropping with `object-contain`, which fixed the frame and
      left ink letterbox around it. Both offending cells now hold the ratio
      themselves: the case-study card is `aspect-video shrink-0` in both modes
      with the notes taking the slack, and the VSL cell is `aspect-video
self-center` — `self-center` being the part that matters, because a
      stretched grid item has a definite height and `aspect-ratio` is then a
      suggestion the browser may ignore. Measured across seven page/viewport
      pairs: every box and every video 1.78, and the case-study panel overflows
      by 0.

### Added mid-sprint, twentieth round (owner, 2026-09-04)

- [x] **The lattice has its column back and the headline sits at its foot.**
      Lifting the headline was tried the round before and reversed here: the
      morph wants the whole height to read as one motion, and the heading holding
      the floor under it is the composition. Both headlines are a step larger to
      pay for it — 67px on the home strip, 72px on `/about`.
- [x] **The offering headings fill the space they were given.** 40px in a cell
      most of a screen wide left the panel looking empty around them; 54px with
      the paragraph a size up reads as the subject of the panel rather than a
      caption in it. `/about`'s sections match at 52px.
- [x] **"Micro Agents / Bots for Particular Task Automation" is shorter.** Three
      lines at the new size, and "particular" was not earning its place. It is
      "Micro Agents & Bots for Task Automation" — the owner allowed a tweak for
      readability; the other three names are untouched.
- [x] **`/about`'s headline has even padding.** `pb-0` read as the heading being
      shoved against the seam below it. 27px above and below now.
- [x] **The four schematics are drawn denser, and the density says something.**
      Satellites chain to their neighbours as well as to the hub, and each pair
      of clusters is joined by two arcs bowed opposite ways — a star says "one
      model, many calls", a ring says the narrow agents talk to each other. Each
      micro unit has a queue at its mouth, a rule stack and a state lamp, all of
      it _inside_ the unit because the isolation is the claim. The pipeline gates
      have fill meters and a reject path falling away from each one, which every
      real pipeline has and no diagram of one ever draws. The integration hub
      gained an outer orbit of traffic that never lands, and its four systems
      have field rules inside them so they read as records rather than plates.

### Added mid-sprint, twenty-first round (owner, 2026-09-04)

> "the part on right, we don't need any animation there and it's not looking
> good, utilise smh else, maybe our branding like oddcommon is doing on their
> main page with a chromium logo"

- [x] **The lead magnet's second cell is the mark, not a lattice.** The morph ran
      there and was motion for its own sake beside the one control on the page
      that matters. It is the logomark now, extruded into a chrome solid with a
      contact shadow — read from oddcommon's homepage wordmark, which is an
      iridescent extrusion sitting in the panel like an object.
- [x] **Chrome, not an oil slick.** Theirs runs a full rainbow; this site has
      paper, ink and one accent, and a mark cycling through orange and violet
      would be the largest area of colour on the page and none of it ours. The
      surface is polished metal — a greyscale band structure with the lime woven
      in twice, where the oil slick puts its hue shifts.
- [x] **Generated, and 14 KB.** `npm run gen:chrome-mark` builds it from
      `loader-mark.ts`, the same source the loader and the favicon read, so the
      mark cannot drift between them. The first version emitted the path data
      once per extrusion slice and came to **294 KB** for a decorative picture;
      one `<defs>` group and a `<use>` per slice says the same thing in a
      twentieth of the space. The panel also loses a canvas and a render loop.

### Added mid-sprint, twenty-second round (owner, 2026-09-04)

- [x] **The VSL is one section, not three.** The claim, a vertical "Demo reel"
      tile and the film were separate grid children, and a seam on this grid is
      a visible hairline — so the panel read as three adjacent things rather
      than one offer. The tile is gone and the other two share a cell: claim on
      the left third, film on the rest, nothing drawn between them. The panel
      also drops from 1.2 screens to 1, because the extra fifth was room for the
      three cells and with two it just ran the film off the trailing edge.
- [x] **The cloth panel is Labs.** It was "Who's behind it", which `/about`
      already covers at length. It now carries the other half of the company —
      a room, a budget and no revenue target, "Make something wonderful" — with
      **"We rarely hire."** set above `jobs@godwinausten.org`. An address, not a
      form or a careers page: there is no pipeline behind it, and the caveat sits
      above the address so nobody reads it as an opening. The anchor is `#labs`
      now and the VSL's hand-off names it.
- [x] **A "Contact us" on every offering — and one on a phone.** Four of them in
      a stacked column is a page nagging rather than offering, so the per-card
      buttons are hidden below `md` and a single one renders under the whole
      section instead. Side by side there is no repetition to feel: each belongs
      to the offering above it and only one is ever in view. Outlined rather than
      filled, because the lead magnet's download is the page's one filled accent
      and the brief rations lime to it. On both the home columns and `/about`'s
      sections — same four services, same offer.

### Added mid-sprint, twenty-third round (owner, 2026-09-04)

- [x] **The VSL is one section.** Claim, a vertical "Demo reel" tile and the film
      were three grid children with two visible hairlines between them. The tile
      is gone, the other two share a cell, and the panel narrows from 1.2 screens
      to 1 — the extra fifth was room for three cells and with two it only ran
      the film off the trailing edge.
- [x] **The cloth panel is Labs, and the cloth is gone.** It carries the other
      half of the company: "If you have a skill, we need you", the paragraph, and
      "Send us your crazy ideas or work" over `jobs@godwinausten.org`. The
      `ClothCanvas` shader is deleted, not disabled — it was the most technically
      interesting thing on the site and the least useful, a WebGL context and a
      render loop behind a paragraph on the one section with nothing to sell.
      The block is no longer `stripOnly`: that existed for a cursor-lit ornament,
      and hiding the company's other half from every phone was a consequence of
      it rather than a decision.
- [x] **The motto is an overprint, not a watermark.** Two versions were built and
      both looked cheap — flat ink at a tenth of an opacity is an invoice
      stamp, and a rainbow gradient behind a turbulence filter is a sticker. It
      is misregistered screen print now: the same words in three flat passes —
      lime, a cool grey, ink — each offset a few pixels, `multiply` where they
      overlap. Sharp edges, the site's own palette, and the same print language
      as the hairlines and flat fills everywhere else.
- [x] **A "Contact us" under every offering, and one on a phone.** Four identical
      buttons down a stacked column is a page nagging; the per-card ones are
      hidden below `md` and a single one renders under the section. Outlined, not
      filled — the download is the page's one filled accent.
- [x] **The service copy states what you get.** "We will build you the whole
      operation… you get agents that hold context" rather than a description of
      the category. All four rewritten on both pages, inside the 180-character
      panel budget the copy test enforces.
- [x] **The wordmark is 20px and names the route.** It was set at caption size —
      the signature was the smallest type on the page. `/work`, `/about` and
      `/contact` appear beside it; the home page shows nothing, because "/" next
      to a wordmark that is already the home link says nothing.
- [x] **The hero figure has colour in it.** A third masked pass over the two ink
      ones, filled with a gradient: the trace is one path so individual strokes
      cannot be reached, but tinting regions of a tangle produces bands of
      coloured line running through black ones, which is the same effect for one
      more element and no second file.
- [x] **The lead magnet's mark is flat, centred and unccroppable.** The extrusion
      and contact shadow are gone at the owner's request, and with them the
      asymmetric padding that made the mark sit off-centre in its own file. It is
      bounded by the cell's _height_ now — a box with the mark's own very tall
      proportions overflowed any short panel and got clipped.
- [x] **The rail's labels cannot clip.** A full page gutter inside each quarter
      of a narrow screen left less room than the words needed. The inset scales
      with the cell, and `truncate` makes the worst case an ellipsis rather than
      a letter cut down the middle.

### Added mid-sprint, twenty-fourth round (owner, 2026-09-04)

> "see the slipping in contact page" · "add some splashing colors around the
> watermark as well" · "IT SHOULD NOT AT ALL LOOK LIKE A KID STYLE"

- [x] **Nothing on `/contact` hangs over a seam.** Every display heading in
      `services-rows` was sized with a `vw` figure, and the block's tracks are
      `0.8fr` for the heading against `repeat(--svc-count, 1fr)` for the
      offerings — a _share_, not a fixed fraction of the window. The same 4vw
      landed in a 491px column on `/` and a 294px one on `/contact`, where
      "addresses." came out 302px wide in a 214px box and hung 88px into the cell
      beside it. The headings are sized `min(vw, cqi)` against a container now:
      the window figure still wins wherever the column is roomy, so the wide
      pages are pixel-identical, and the column figure takes over where it is
      not. The same applied to the offering titles ("Everything" ran out of its
      column at 900px) and to the detail paragraphs, which open with an
      unbreakable email address.
- [x] **The heading track has a floor.** Below about 1000px its share fell to
      180px, a column too narrow to set a display word in at any size —
      "addresses." broke across the middle of the word. `min(18rem, 26vw)` is
      the width below which the heading stops being typography.
- [x] **Colour on the Labs watermark, as a print rather than a picture.** Two
      narrow spot-colour bands crossing at different angles, and ink thrown in
      from two corners as several dozen specks that thin as they travel. The
      first attempt at this was big flat corner plates and the owner was right
      about them: a shape that large has to be _drawn_, and a drawn shape in
      three primaries is a child's collage. Scale is the whole difference — ink
      lands in specks a few pixels across, never in slabs.
- [x] **The print reaches the panel's edges.** It was a grid column and
      inherited the row's vertical padding, so the bands — drawn long precisely
      so they never end on screen — were cut off square with paper still showing
      above and below the cut. It is a positioned layer on the cell now.

### Added mid-sprint, twenty-fifth round (owner, 2026-09-04)

> "remove the Let's talk small row in the contact page" · "add a custom cursor
> like a small dot ... visible properly on both black and white backgrounds" ·
> "bring the 'We have shipped this' after the 'What we offer'" · "make the
> background of 'Steal our day 1 worksheet' the same light colored as in the
> whole site and keep the background behind the colorful logo same dark"

- [x] **`/contact` opens on its headline.** The header's eyebrow said "Let's
      talk" directly above "Tell us what you're doing by hand." — the same
      invitation twice, the second time in 11px mono, on the one page whose
      subject is already named in the nav beside the wordmark. `page-header`
      already took the eyebrow as optional; `/contact` no longer sets it.
- [x] **A pointer of our own.** A dot on the pointer and a ring chasing it, both
      painted white through `mix-blend-mode: difference` so they come out as the
      inverse of whatever is behind them — dark on paper, light on an ink cell,
      legible over the film. Nothing samples the background and nothing has to
      be told what it is over. The ring opens over anything pressable; text
      fields keep their native caret and the layer hides there, because a caret
      says where the next character goes and a dot near a field does not. The
      native cursor is hidden by an attribute the component sets only after
      confirming a fine pointer, so no-JS and touch visitors are never left with
      `cursor: none` and nothing drawn in its place.
- [x] **Mechanism before proof on the home page.** "What we offer" is 01 and "We
      have shipped this" is 02. It is the question a cold reader arrives with,
      and the build then reads as evidence for a claim they have already been
      given rather than as a case study for a company they cannot yet describe.
      The indices and the hand-off links renumber with it; both the unit chain
      test and the e2e order test were updated to the new argument.
- [x] **The offer sits on paper.** The lead magnet's copy cell was an ink block
      and is now the site's own paper; the mark's cell beside it stays dark, so
      the dark is a frame for the one coloured thing on the panel rather than the
      ground the reader has to read on. The field's colours now take their ground
      as an argument — it opens in a dark dialog once hydrated but in the paper
      cell before that, and one palette could not be right in both.

### Added mid-sprint, twenty-sixth round (owner, 2026-09-04)

> "Make the background of logo white as well" · "give it an effect as if the two
> parts of svg are two seperate blocks and they are magnetically replusive to the
> cursor so if the cursor comes close it repels them and even if the cursor stays
> but the canvas moves beneath it the effect reflects"

- [x] **The whole lead magnet is one ground.** The mark's cell is paper too now,
      so the panel reads edge to edge and the mark is the only colour on it.
- [x] **The mark got its outline back.** The film is anchored on white, which was
      free on an ink cell — the light bands were the highlights. On paper they
      are the _background_, and the shape dissolved into it at the edges. A
      hairline in the site's own ink, at the weight of every other rule.
- [x] **Three files, one mark.** `gen:chrome-mark` emits one SVG per shape, each
      carrying the whole mark's box and identical film geometry, so three layers
      stacked at one size reassemble it with no seam. Their centres go into a
      generated TypeScript module beside the shapes, because a component cannot
      see from three identical boxes where any individual part actually is.
- [x] **The parts repel the pointer, and keep repelling it when the page moves.**
      Each shape is pushed along the line from the pointer to its own centre,
      with a squared falloff and a travel proportional to its own size — the dot
      does not swing as far as the shape it sits on. The loop re-measures the
      mark every frame rather than caching it on `pointermove`, which is what
      makes the effect correct on this site specifically: the home page's
      composition slides horizontally, so the mark passes _under_ a pointer that
      has not moved, and a purely pointer-driven version sits frozen while the
      thing it is repelling walks through it. Eased on the wall clock; inert
      under `prefers-reduced-motion` and on a coarse pointer; the frame loop only
      runs while the mark is on screen.
- [x] **Nothing here has a pixel in it.** The parts' positions are fractions of
      the painted mark and the loop redoes the `contain` fit itself, so the whole
      thing is responsive without a breakpoint.

**One bug worth recording.** The pointer starts at negative infinity so nothing
is repelled before it has been seen — and `Infinity / Infinity` is `NaN`. The
unit vector came out `NaN`, the eased offset inherited it on the very first frame
and never recovered, and every transform after that was a string the browser
rejected outright. The parts sat still, no error was reported anywhere, and the
loop was running the whole time. Out of range now means zero, not "the direction,
times zero".

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

- [x] **Name the three offerings as claims, not categories?** _Answered by
      adding a layer rather than renaming._ oddcommon's `/expertise` heads its
      three principles with positions — "Just Enough Strategy", "Allergic to the
      grand reveal", "Go big on craft". Ours were "Workflow Mapping", "Agent
      Swarms", "Systems Integration": accurate, and indistinguishable from any
      other agency's service list. Both now ship — the category stays in the
      eyebrow, where it is the thing you file the offering under, and the claim
      sits in display type above the detail, where it is the thing that earns
      the read. Renaming would have cost the scannability; stacking them cost a
      line each.

- [ ] **Their closing CTA is a repeating "Work with us /" marquee,** and
      enquiries go to a named person with a direct address rather than a
      `hello@` alias. Both are cheap to build and a bigger change of voice than
      I would make unasked. Want either?

- [ ] **The brief says "No photography" and the site now ships four
      photographs.** `docs/brief.md` § Visual direction still carries the
      original rule; `docs/photo-credits.md`, `PHOTO` in `compositions.ts` and
      the `/about` pillars contradict it. The code is almost certainly right and
      the brief is stale, but §7.1 makes the brief the higher authority, so I
      have not edited that row. Confirm and I will correct it.

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
      CRM, or does this trigger the data-layer decision in `docs/data-layer.md`?
      **The download does not answer this.** The visitor now gets the file
      immediately, but the address is still only validated and logged — so the
      opt-in currently converts without capturing anything we can act on. That
      is a bigger hole now that the flow looks finished than it was when it
      obviously was not.
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
