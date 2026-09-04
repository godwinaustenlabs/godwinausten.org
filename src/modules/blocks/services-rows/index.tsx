import { SiteLink } from "@/modules";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/Label";
import { Panel } from "@/components/ui/Panel";
import { Cell, NextCell } from "@/components/ui/Cell";
import { ScrollMorph } from "@/components/ui/ScrollMorph";
import type { ServicesRowsProps } from "./block.config";

/**
 * How it gets built — the section holds, and the offerings move through it.
 *
 * ## The hold
 *
 * On the filmstrip this is the one section that stops the sideways travel. The
 * whole group parks against the leading edge and the three offerings rise past
 * it one at a time; when the third lands, the hold runs out and the page
 * resumes moving left. You read the question once and then get all three
 * answers against it, in sequence, without the heading ever leaving.
 *
 * Two custom properties do it, both published by `BlockFrame` under
 * `layout.stickyHead`:
 *
 * - `--block-lead`, a length, offsets the group so it stands still.
 * - `--block-hold`, the same travel as 0→1, drives the stack inside it.
 *
 * The second exists because CSS cannot divide a length by a length: there is no
 * way to ask `calc()` what fraction of its range `--block-lead` has covered,
 * and a stack that must move by a proportion of its own height needs the
 * fraction rather than the pixels.
 *
 * `position: sticky` cannot do any of this — inside the filmstrip's transformed
 * track there is no scrollport for it to stick to, so it silently does nothing.
 *
 * ## Everywhere else
 *
 * Below the strip both wrappers are `display: contents` and this is the grid it
 * always was: three columns at `md`, a plain stack on a phone, the head pinning
 * itself on Y. Nothing about the hold survives into vertical flow, where the
 * page already scrolls the way the content wants to be read.
 *
 * ## The bar
 *
 * The ink column is not decoration. It gives the offerings an edge to vanish
 * behind rather than sliding under a transparent heading, and it is what makes
 * the held group read as a fixed frame the content moves through.
 */
export default function ServicesRows({
  index,
  eyebrow,
  headline,
  rows,
  next,
  lattice,
  display,
  cta,
}: ServicesRowsProps) {
  if (display === "sections") {
    return (
      <ServiceSections index={index} eyebrow={eyebrow} headline={headline} rows={rows} cta={cta} />
    );
  }

  return (
    <Panel
      width={2}
      /*
       * Both of the numbers that depend on how many offerings there are come
       * from `rows.length`, not from a literal.
       *
       * They were `repeat(3, ...)` and `-200%`, correct for exactly three cells
       * and silently wrong for any other count: a fourth offering flowed into an
       * implicit column at `md`, and on the strip the stack travelled two
       * windows out of three so the last cell never arrived. Derived, adding one
       * is a content change again.
       */
      style={
        {
          "--svc-count": rows.length,
          "--svc-travel": `${(rows.length - 1) * -100}%`,
        } as React.CSSProperties
      }
      /*
        The headline track carries a floor.

        `0.8fr` against `repeat(--svc-count, 1fr)` is a *share*, and on a narrow
        desktop that share is 180px — a column too narrow to set a display word
        in at any size, where "addresses." broke across the middle of the word.
        `min(18rem, 26vw)` is the width below which the heading stops being
        typography; the `min` keeps it from ever claiming more of a small window
        than the offerings can spare, and above about 1400px the natural share is
        larger anyway, so nothing on the wide pages moves.
      */
      className="grid-rows-[auto_auto_1fr_auto] md:grid-cols-[minmax(min(18rem,26vw),0.8fr)_auto_repeat(var(--svc-count),minmax(0,1fr))] md:grid-rows-[auto_1fr_auto] strip:grid-cols-1 strip:grid-rows-1 strip:bg-paper"
    >
      {/*
        On the filmstrip the whole section holds still and the offerings move
        *vertically* inside it. Everywhere else this wrapper is `display:
        contents` and the grid below is exactly the grid it always was.

        ## Why the panel is 2vw wide but the content is 1

        The engine's pin is driven by how far a section has travelled past the
        leading edge, and it clamps at `extent - viewport`. A panel exactly one
        screen wide therefore has **no** pin budget: it is never past the edge
        while still covering the screen. The second screen-width is not content,
        it is the scroll budget — the group below is one screen wide, offset by
        `--block-lead`, so it sits still for the whole 200vw traverse and the
        empty half is never seen.

        This is the same primitive the head used to use on its own. The change
        is that it now holds the *entire* section, so the eyebrow bar and the
        hand-off hold with it — pinning only the middle and letting the bars
        slide is what would read as broken.
      */}
      <div className="contents strip:grid strip:h-full strip:w-screen strip:[transform:translate3d(var(--block-lead,0px),0,0)] strip:grid-cols-[minmax(0,30fr)_auto_minmax(0,70fr)] strip:grid-rows-[auto_1fr_auto] strip:gap-[var(--seam)] strip:bg-hairline strip:will-change-transform">
        <div className="cell col-span-full flex-row items-center gap-4 px-gutter py-3">
          <Label tone="ink" className="opacity-40">
            {index}
          </Label>
          <Label>{eyebrow}</Label>
        </div>

        {/*
          The head. In vertical flow it still pins itself with `--block-lead` on
          Y while its rows scroll past; on the strip the wrapper above already
          holds it, so it needs no transform of its own.

          `col-span-full`, not `col-span-2`: below `md` this grid declares no
          columns, so it has exactly one. A child asking for two columns there
          does not get a wider cell — it makes the grid grow an *implicit*
          second column that nothing sized, and every cell after it flows into
          the pair. `1 / -1` spans the explicit grid and creates nothing.
        */}
        <Cell
          className="z-20 col-span-full [transform:translate3d(0,var(--block-lead,0px),0)] bg-paper will-change-transform md:col-span-1 strip:[transform:none]"
          // Without the lattice there is nothing above the headline to hold it
          // down, so bottom-aligning it left the cell top-heavy with empty
          // paper. Centred, it sits in the middle of the space it is given.
          /*
            The lattice takes the column and the headline sits at its foot.
            Lifting the headline was tried and reversed by the owner: the
            morph wants the whole height to read as one motion, and the
            heading holding the floor under it is the composition.
          */
          bodyClassName={lattice ? "justify-between gap-6" : "justify-center"}
        >
          {/* The lattice, in the space above the headline: a stack of dots that
              becomes a cube, a knot, then a network. It runs on the *hold*, so
              every phase happens while the heading is stuck and visible — and
              now while the offerings are travelling up past it. */}
          {/*
            Hidden below `md`, where it is dead weight rather than decoration:
            the lattice is driven by the *pin*, and `--block-lead` is a flat 0
            under `PIN_MIN_WIDTH` (768px), so on a phone it renders one frozen
            frame and never moves. `display: none` also parks its
            `IntersectionObserver`, so it costs nothing there.
          */}
          {lattice ? <ScrollMorph className="hidden min-h-0 flex-1 md:block" /> : null}

          {/*
            The heading is sized by *this column*, not by the window.

            It used to be a plain `4vw` clamp, which is only right when the
            column is a fixed share of the viewport — and it is not. The track is
            `0.8fr` against `repeat(--svc-count, 1fr)`, so the same 4vw lands in
            a 491px column on a page with the offerings and a 294px one on
            `/contact`. There "addresses." came out 302px wide in a 214px box and
            hung 88px over the seam into the cell beside it.

            `min(4vw, …cqi)` keeps the window-sized figure wherever the column is
            roomy and only takes over when it is not, so nothing about the wider
            pages changes. `break-words` is the backstop: it costs nothing until
            a single word cannot fit at any size, and then it breaks rather than
            spills — copy is edited far more often than this file.
          */}
          <div className="@container shrink-0">
            <h2 className="font-display text-[clamp(2rem,min(4vw,19cqi),4.25rem)] leading-[0.92] font-bold break-words text-ink">
              {headline}
            </h2>
          </div>
        </Cell>

        {/* The bar the offerings pass behind. */}
        <div
          aria-hidden="true"
          className="z-20 hidden [transform:translate3d(0,var(--block-lead,0px),0)] bg-ink will-change-transform md:block md:w-10 strip:[transform:none]"
        />

        {/*
        Each offering: the claim at the head of the cell, the detail at its foot.

        The cell is as tall as the panel, and three lines of prose pinned to its
        floor left the upper two-thirds empty — the row read as a caption adrift
        in a blank box. What fills it is not an illustration but the **point**:
        `title` in the eyebrow names the category ("Workflow Mapping", which any
        agency could write), and `claim` states what that does for the reader,
        set large enough to be read first.

        Read from oddcommon's `/expertise`, which heads each of its three
        principles with a position rather than a label — "Allergic to the grand
        reveal", not "Process". The category is what you file it under; the claim
        is what makes someone read the paragraph under it.

        Claim and detail sit together at the **foot**, never one at each end:
        splitting them put 400px of nothing between two things that argue with
        each other, which reads as a fault rather than as space. As one block on
        the floor they land on the same baseline as the pinned headline to their
        left.

        The slack above them takes `figure` — a schematic of the offering, the
        same role the lattice plays in the head cell. It is the drawing that
        makes the cell a composition rather than a text block with air over it,
        and `flex-1` on it is what holds the text group on its baseline.

        Both fields are optional and independent: /about runs this same block as
        a plain list, where a claim per row would be three assertions about
        nothing and a diagram per row three drawings of it.
      */}
        {/*
          The travelling stack.

          Below the strip both of these are `display: contents` and the cells are
          ordinary grid items — side by side at `md`, stacked on a
          phone. On the strip the outer one becomes the window (one grid column,
          panel-tall, clipping) and the inner one the film: every cell the full
          height of that window, so the stack is `count x 100%` of its own box.

          It is driven by `--block-hold`, the pin's travel as 0→1, which is why
          the engine publishes a unitless number as well as a length. A
          percentage translate resolves against the element's *own* height, so
          the travel is `(count - 1) x -100%` — one window short of the stack,
          because the last cell has to land rather than pass. Hold 0 shows the
          first offering and hold 1 the last, and the moment the last lands the
          pin runs out and the section leaves to the left.
        */}
        <div className="contents strip:relative strip:block strip:h-full strip:overflow-hidden">
          <div className="contents strip:block strip:h-full strip:[transform:translate3d(0,calc(var(--block-hold,0)*var(--svc-travel)),0)] strip:will-change-transform">
            {rows.map((row, i) => (
              <Cell
                key={row.index}
                /*
                  No eyebrow bar.

                  The offering's name is the heading now, set in display type
                  where it can be read, so a mono bar repeating it above was the
                  same words twice at two sizes. The index moves into the body
                  beside the heading, which also retires the bar-height problem
                  those wrapping titles had created.

                  The seam between offerings is the grid's gap in flow, but
                  inside the clipping window there is no grid — so every one
                  after the first draws its own.
                */
                className={cn("strip:h-full", i > 0 && "strip:border-t strip:border-hairline")}
                /*
                  Stacked in flow, laid across on the strip.

                  Held, an offering owns a window most of a screen wide — far too
                  wide for a 14ch claim and a 32ch paragraph to sit alone in a
                  column, which left two thirds of it bare. Across, the text takes
                  the edge nearest the pinned headline (so the eye goes headline →
                  claim without crossing the drawing) and the schematic takes the
                  rest at full height.
                */
                bodyClassName={cn(
                  "justify-between gap-8",
                  "strip:flex-row strip:items-center strip:justify-between strip:gap-[5vw]",
                )}
              >
                {row.figure ? (
                  <div
                    aria-hidden="true"
                    /*
                      `min-h-28` below `md`, `min-h-0` above it. In vertical flow
                      the cell is only as tall as its text, leaving this a ~60px
                      sliver — and `contain` fits the drawing to the *short* side,
                      so it would render at 60px square and read as a smudge. On
                      the strip the cell is a whole window tall, the slack is
                      real, and the floor comes off.
                    */
                    /*
                    `py` on the strip so the drawing never runs to the top or
                    bottom of its cell. `bg-contain` already fits the artwork
                    inside the box, but a box that reaches the cell's edge puts
                    the outermost strokes hard against the seam, which reads as
                    a crop even though nothing is cropped.
                  */
                    className="pointer-events-none min-h-28 flex-1 bg-contain bg-center bg-no-repeat md:min-h-0 strip:order-2 strip:w-[50%] strip:flex-none strip:self-stretch strip:py-[6%]"
                    style={{ backgroundImage: `url(${row.figure})` }}
                  />
                ) : null}

                <div className="shrink-0 strip:order-1 strip:max-w-[34ch]">
                  {/*
                    The accent, and the only colour in the row. Same rule and
                    proportion as the lead-magnet cover, so the two read as one
                    system rather than two ideas about where lime is allowed.
                  */}
                  <span aria-hidden="true" className="mb-5 block h-1.5 w-10 bg-signal" />
                  <div className="mb-5 flex items-baseline gap-3">
                    <Label tone="ink" className="shrink-0 opacity-30">
                      {row.index}
                    </Label>
                    {/*
                      Sized by the space it actually has, for the same reason the
                      section heading is: these tracks are `1fr` of whatever is
                      left over, so a window-sized figure has no idea how much
                      room it is in, and "Everything" ran out of its column at
                      900px.

                      The `@container` is on the wrapper, never on the heading.
                      An element that declares a container is not its own query
                      container, and `container-type: inline-size` also stops its
                      width being decided by its content — put on the `h3` itself
                      it collapsed to nothing, and `break-words` then set the
                      title one letter per line.
                    */}
                    <div className="@container min-w-0 flex-1">
                      <h3 className="max-w-[15ch] font-display text-[clamp(1.6rem,min(3.6vw,16cqi),3.4rem)] leading-[0.98] font-bold text-balance break-words text-ink">
                        {row.title}
                      </h3>
                    </div>
                  </div>
                  {/* The detail opens with an address, and an address is one
                      unbreakable token. In a narrow column it hung over the seam
                      exactly the way the headings did. */}
                  <p className="max-w-[34ch] font-sans text-base leading-relaxed break-words text-soft lg:text-lg">
                    {row.detail}
                  </p>

                  {/*
                    One button per offering — and, on a phone, one button.

                    Stacked, the four cells become four sections of a scroll, and
                    the same "Contact us" four times in a column is a page
                    nagging rather than offering. Hidden below `md` and rendered
                    once under the whole section instead. Side by side there is
                    no repetition to feel: each button belongs to the offering
                    above it and there is only ever one in view.
                  */}
                  {cta ? <ServiceCta cta={cta} className="mt-7 hidden md:inline-flex" /> : null}
                </div>
              </Cell>
            ))}
          </div>
        </div>

        {cta ? (
          <div className="cell col-span-full px-gutter py-6 md:hidden">
            <ServiceCta cta={cta} className="w-full justify-center" />
          </div>
        ) : null}

        {next ? (
          <div className="cell col-span-full hidden md:flex">
            <NextCell next={next} />
          </div>
        ) : null}
      </div>
    </Panel>
  );
}

/**
 * One section per offering, for a page someone came to in order to read.
 *
 * The columns layout above is a summary glanced at in sequence while the reader
 * travels the filmstrip, and four cells wide enough for a claim are not wide
 * enough for a service to be explained in. On `/about` that produced four
 * columns of small print under mono captions — the least prominent thing on a
 * page whose whole job is to say what the company sells.
 *
 * Here each offering is the full width of the panel with a seam under it: an
 * index, a heading in display type, the paragraph at a readable measure, and its
 * schematic beside it. They read as four sections rather than four columns, and
 * the type is the size the subject deserves.
 *
 * No pin, no held head, no travelling stack. Those exist to make a wide panel
 * legible while it moves past; nothing here moves.
 */
function ServiceSections({
  index,
  eyebrow,
  headline,
  rows,
  cta,
}: Pick<ServicesRowsProps, "index" | "eyebrow" | "headline" | "rows" | "cta">) {
  return (
    <Panel className="grid-rows-[auto_auto]">
      <div className="cell col-span-full flex-row items-center gap-4 px-gutter py-3">
        <Label tone="ink" className="opacity-40">
          {index}
        </Label>
        <Label>{eyebrow}</Label>
      </div>

      {/*
        The headline opens the list; it does not sit in a band of its own.

        Centred in a full-width cell with a seam under it, it read as a footer
        rule — a strip of big type between two sections rather than the top of
        one. Aligned to the top of its cell with the space taken out from under
        it, it sits directly above the first offering and belongs to it — but
        with the cell's own padding intact on both sides. `pb-0` was tried and
        read as the heading being shoved against the seam below it: a heading
        needs the same air under it as over it, or the section it introduces
        looks like it has started too soon.
      */}
      <Cell className="col-span-full" bodyClassName="justify-start">
        <h2 className="max-w-[18ch] font-display text-[clamp(2.4rem,5.4vw,4.5rem)] leading-[0.92] font-bold text-ink">
          {headline}
        </h2>
      </Cell>

      {rows.map((row) => (
        <div
          key={row.index}
          className="cell col-span-full flex-col gap-8 px-gutter py-[clamp(2rem,5vh,3.25rem)] md:flex-row md:items-center md:gap-12"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-4">
              <Label tone="ink" className="shrink-0 opacity-30">
                {row.index}
              </Label>
              <h3 className="font-display text-[clamp(1.9rem,3.8vw,3.25rem)] leading-[1] font-bold text-balance text-ink">
                {row.title}
              </h3>
            </div>
            <p className="mt-4 max-w-[52ch] font-sans text-base leading-relaxed text-soft md:ms-[calc(1.5rem+1ch)] lg:text-lg">
              {row.detail}
            </p>
            {cta ? (
              <ServiceCta
                cta={cta}
                className="mt-6 hidden md:ms-[calc(1.5rem+1ch)] md:inline-flex"
              />
            ) : null}
          </div>

          {row.figure ? (
            <div
              aria-hidden="true"
              /* Fixed box rather than a flex share: the schematics are drawn to
                 different aspect ratios, and letting each one size its own cell
                 made four rows that stepped in and out. */
              className="pointer-events-none h-32 w-full shrink-0 bg-contain bg-center bg-no-repeat md:h-40 md:w-[16rem] lg:w-[20rem]"
              style={{ backgroundImage: `url(${row.figure})` }}
            />
          ) : null}
        </div>
      ))}

      {cta ? (
        <div className="cell col-span-full px-gutter py-6 md:hidden">
          <ServiceCta cta={cta} className="w-full justify-center" />
        </div>
      ) : null}
    </Panel>
  );
}

/**
 * The offering's call to action.
 *
 * Outlined rather than filled: the lead magnet's download is the page's one
 * filled accent and the brief rations lime to it (docs/brief.md). Four filled
 * buttons here would take that budget and spend it on the section before the
 * offer.
 */
function ServiceCta({
  cta,
  className,
}: {
  cta: NonNullable<ServicesRowsProps["cta"]>;
  className?: string;
}) {
  return (
    <SiteLink
      href={cta.href}
      className={cn(
        "group/cta inline-flex items-center gap-3 border border-ink/25 px-5 py-3 font-sans text-sm font-medium text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper",
        className,
      )}
    >
      {cta.label}
      <span aria-hidden="true" className="transition-transform group-hover/cta:translate-x-0.5">
        →
      </span>
    </SiteLink>
  );
}
