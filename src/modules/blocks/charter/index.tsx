import { Label } from "@/components/ui/Label";
import { MediaCell } from "@/components/ui/Cell";
import { cn } from "@/lib/utils";
import type { CharterProps } from "./block.config";

/**
 * Who we are — the one section on the site allowed to state an ambition.
 *
 * ## Where the drama comes from
 *
 * Not from adjectives. The brief bans the whole vocabulary that usually carries
 * a section like this, and it is right to: a paragraph about pushing boundaries
 * that is *made of* the word "boundaries" convinces nobody. So the size of the
 * claim does the work instead, and it gets the two things this site reserves for
 * what matters most — the largest display type on any sub-route, and an ink
 * ground, so the page goes dark on the way past.
 *
 * `/about` otherwise runs paper from the masthead to the closing statement, and
 * a reader scrolling it has no landmark between them. This is the landmark.
 *
 * ## Headed sections, and three of them lit
 *
 * The first cut was three long paragraphs and then a row of three cards holding
 * the horizon, the vision and the mission. Both halves failed the same way: the
 * prose was too long to scan and the cards were too short to say anything, so
 * the section made its argument twice at two lengths and neither was the right
 * one. And a card is the pattern this site does not have — see the card test in
 * `docs/brief.md`.
 *
 * So the argument runs as headed sections a reader can take at whichever
 * resolution they want, and the three commitments are **spotlights** inside it:
 * ink, the accent rule, one size up. They punctuate the prose rather than
 * summarising it underneath, and they get more room than a card would have
 * given them rather than less.
 *
 * The registrations those cards were built to carry — a PSEB approval, a DUNS
 * record — come back as their own thing when they exist. There was nothing to
 * put in the slot, and a row of empty ones is a page advertising what it has
 * not got.
 */
export default function Charter({
  index,
  eyebrow,
  headline,
  lead,
  figure,
  backdrop,
  sections,
}: CharterProps) {
  /*
    The page runs plain sections and then the lit ones, and they are rendered as
    two groups rather than one list — the lit run has to share a single cell so
    it can share a single photograph behind it.

    A partition rather than a fold over the list, because the order is a fact
    about the content: the argument is made first and what it commits us to is
    stated at the end. A lit section in the middle would be a copy change that
    wants a layout decision, and this is where it would be noticed.
  */
  const plain = sections.filter((section) => !section.spotlight);
  const lit = sections.filter((section) => section.spotlight);

  return (
    <div className="grid-cells grid w-full">
      {/*
        The masthead: the claim, and the picture beside it.

        Two cells rather than one box holding both. The picture is full-bleed —
        it runs the height of the panel and butts the type on the grid's own
        one-pixel seam, which is how every other picture on this site is placed
        and is what stops it reading as an illustration dropped into a paragraph.
      */}
      <div
        className={cn(
          "grid-cells col-span-full grid",
          figure && "md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]",
        )}
      >
        <div className="cell cell-ink">
          <div className="cell-bar border-b border-paper/15">
            <Label tone="paper" className="opacity-40">
              {index}
            </Label>
            <Label tone="paper" className="opacity-70">
              {eyebrow}
            </Label>
          </div>

          <div className="flex flex-1 flex-col justify-center gap-[clamp(1.5rem,3.5vh,2.5rem)] px-gutter py-[clamp(2.5rem,7vh,4.5rem)]">
            {/* The accent rule, at statement scale. Same mark that heads every
                service claim, given the width the sentence under it deserves. */}
            <span aria-hidden="true" className="block h-1.5 w-16 bg-signal" />

            <h2 className="max-w-[16ch] font-display text-[clamp(2.1rem,5.2vw,5rem)] leading-[0.92] font-bold text-paper">
              {headline}
            </h2>

            <div className="flex max-w-[56ch] flex-col gap-5">
              {lead.map((paragraph) => (
                <p
                  key={paragraph}
                  className="font-sans text-base leading-relaxed text-paper/70 lg:text-lg"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>

        {figure ? (
          <MediaCell className="min-h-[clamp(15rem,58vw,22rem)] md:min-h-0">
            <div
              aria-hidden="true"
              /*
                Decorative. There is no alternative text for this that is not a
                description of a mood or a repeat of the headline beside it.
              */
              className="size-full bg-cover bg-center"
              style={{ backgroundImage: `url(${figure})` }}
            />
          </MediaCell>
        ) : null}
      </div>

      {/*
        The plain sections, one cell each.
      */}
      {plain.map((section) => (
        <div key={section.index} className="cell">
          <Section section={section} />
        </div>
      ))}

      {/*
        The lit run — all three commitments in **one** cell, over one photograph.

        They were a cell each, and each cell paints its own `cell-ink` ground, so
        a picture behind them was covered three times over. One cell means one
        ground and one backdrop, and the three sections are told apart by a rule
        between them instead of by the grid's seam. It is the same hairline in
        the same place; what changes is that it is drawn *on* the picture rather
        than being a gap the picture cannot cross.
      */}
      {lit.length > 0 ? (
        <div className={cn("cell cell-ink", backdrop && "relative overflow-hidden")}>
          {/*
            The photograph, under the type.

            ## Why it is a band the shape of the photograph

            Because a picture you can never see all of is not a picture, and a
            picture floating in the middle of a panel is not a background.

            It was `inset-0` first — the full height of the lit run, fitted to
            width — which on a wide screen resolved to an image over 1100px tall
            inside a box nearly three times that. You scrolled past one bright
            shape and then another several hundred pixels later and never saw
            them as one photograph.

            Fitting it with `contain` inside a bounded band fixed that and
            introduced the opposite problem: the frame is 16:9 and the band was
            wider than it, so the picture sat centred with panel either side of
            it and never touched the edges. Small, and obviously placed.

            So the band **is** the photograph's own aspect ratio, and the image
            is sized to `100%` of the width. Nothing is cropped and nothing is
            letterboxed, because the box and the content are the same shape — the
            hands run right out to both edges of the panel the way every other
            picture on this site does.

            The height is `min(56.3vw, 92svh)` and **not** `aspect-ratio` with a
            `max-height`, which is the spelling that looks right and is not: those
            two together shrink the box in *both* directions, so capping the
            height also pulled the width in and the picture came back centred with
            panel either side — the exact thing being fixed. 56.3% is the frame's
            own ratio, so the first term is its natural height and the second is
            only a ceiling for a screen wide enough that the natural height would
            swallow it. Where the ceiling bites, the foot is trimmed rather than
            the whole thing scaled, and the mask below makes that trim invisible.

            ## Why it has no edges — `screen`, and the arithmetic behind it

            The photograph's own black is not the panel's black. Measured off the
            file, its corners sit at #000000–#040404; `--color-ink` is #0E0E0C, a
            warm near-black. Ten or fourteen values of difference is nothing in
            isolation and unmistakable over a thousand-pixel straight edge, so
            the band read as a slightly darker rectangle laid on the panel.

            `mix-blend-mode: screen` removes it, and not by fading anything:
            screen is `1 - (1-base)(1-source)`, so a source pixel of zero
            contributes *exactly* nothing and resolves to the backdrop. Black
            areas of the photograph therefore become the panel's ink to the
            value, the rectangle containing them stops existing, and only the lit
            hands survive. At #040404 the residual is under two values — below
            what an eye can find on a gradient.

            This is the same trick that **failed** on the home page's plates, and
            the difference is worth keeping in mind: those files have lifted
            blacks, so screen pushed their ground *above* the panel's and
            produced a pale rectangle instead of a dark one. Screen is only
            invisible when the source's black is genuinely black, which is a
            property of the file and has to be checked per image.

            ## The foot fades by mask, not by a scrim over the top

            The photograph's own bottom edge is already black and `screen` makes
            black vanish, so on any screen showing the frame whole this does
            nothing at all. It is there for the capped case, where the band cuts
            the frame short — the fade is deep enough to cover the largest trim
            the ceiling can produce.

            The band has to stop somewhere, and the two lit sections below it
            must stay plain — so the picture needs to fall away toward its
            bottom. Doing that with a *second layer* is the trap, and both
            obvious spellings of it put an edge back:

            - A normal-blend gradient ending in `--color-ink` paints the panel's
              own colour over an image that was just screened *to* that colour,
              which redraws the boundary at exactly the line the blend removed.
            - A `multiply` gradient ending in black is worse, and is what shipped
              first: multiply drives the result to **#000000**, while the panel
              around it is #0E0E0C. The foot of the band came out *darker* than
              the page, so the fix for the side edges created a horizontal one.

            So there is no second layer. The image masks itself: a linear
            `mask-image` takes it to transparent toward the foot, and a screened
            layer that is masked away contributes nothing at all — what shows
            through is the cell's ink, unmodified. One layer, one blend, and the
            only colour in play is the panel's own.

            ## Strength

            Held at 0.72, and the figure has moved twice for opposite reasons.

            It started at 0.55, where it vanished: the photograph is nine-tenths
            black, so knocking a backdrop back mostly dims the one-tenth that
            *is* the picture and leaves the rest exactly where it was. It went to
            0.9 for that reason. Then the band went full width, the hands roughly
            trebled in area, and the brightest part of the palm landed directly
            under a display heading — at which point the type genuinely was at
            risk in a way it had never been before.

            0.72 is the level where both survive. Opacity is safe to use here
            precisely because of the blend: `screen` of a black source resolves to
            the backdrop, and interpolating between the backdrop and itself is
            still the backdrop — so lowering it dims the hands without ever
            putting an edge back around them, which is what a scrim would do.
          */}
          {backdrop ? (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-[min(56.3vw,92svh)] bg-[length:100%_auto] bg-top bg-no-repeat"
              style={{
                backgroundImage: `url(${backdrop})`,
                mixBlendMode: "screen",
                opacity: 0.72,
                WebkitMaskImage: "linear-gradient(to bottom, #000 80%, transparent 100%)",
                maskImage: "linear-gradient(to bottom, #000 80%, transparent 100%)",
              }}
            />
          ) : null}

          <div className="relative">
            {lit.map((section, i) => (
              <div key={section.index} className={cn(i > 0 && "border-t border-paper/15")}>
                <Section section={section} />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * One section: the number and heading on the left, the prose on the right.
 *
 * ## Two columns, not one
 *
 * Every section was an index in a narrow margin and then one 62ch column of
 * prose, which on a wide screen is a strip of text with a third of the page
 * empty beside it — the layout that made this the dullest section on the site
 * despite it being the one with the most to say.
 *
 * The width is spent on a *reading path* rather than on a wider measure, which
 * would only make the lines harder to track. The left column is where a scanner
 * stops: the number set large enough to be a landmark, the heading, and one line
 * saying what the section argues. The right is for the reader who carried on,
 * held to a comfortable measure rather than to whatever the window happens to
 * be.
 *
 * Below `md` it stacks, and in that order it still reads — number, heading,
 * thesis, prose.
 */
function Section({ section }: { section: CharterProps["sections"][number] }) {
  const lit = section.spotlight;

  return (
    <div
      className={cn(
        "flex flex-col gap-6 px-gutter md:flex-row md:gap-[clamp(2rem,5vw,5rem)]",
        lit ? "py-[clamp(2.5rem,7vh,4.5rem)]" : "py-[clamp(2.25rem,6vh,3.5rem)]",
      )}
    >
      <div className="md:w-[38%] md:shrink-0">
        <div className="flex items-baseline gap-4">
          {/*
            The number, set as type rather than as a caption.

            At 11px in the margin it was an annotation nobody read. At display
            scale it tells you where you are in a long section without the
            section having to say so.
          */}
          <span
            aria-hidden="true"
            className={cn(
              "font-display text-[clamp(1.75rem,3.2vw,2.75rem)] leading-none font-bold",
              lit ? "text-paper/25" : "text-ink/20",
            )}
          >
            {section.index}
          </span>
          {lit ? <span aria-hidden="true" className="h-1 w-8 shrink-0 bg-signal" /> : null}
        </div>

        <h3
          className={cn(
            "mt-4 font-display leading-[1.02] text-balance",
            lit
              ? "text-[clamp(1.75rem,4vw,3rem)] font-bold text-paper"
              : "text-[clamp(1.5rem,3vw,2.5rem)] font-medium text-ink",
          )}
        >
          {section.title}
        </h3>

        {section.pull ? (
          <p
            className={cn(
              "mt-5 max-w-[26ch] border-t pt-5 font-display text-[clamp(1.05rem,1.7vw,1.4rem)] leading-[1.25] font-medium",
              lit ? "border-paper/15 text-paper/80" : "border-hairline text-ink/75",
            )}
          >
            {section.pull}
          </p>
        ) : null}
      </div>

      {/*
        Pushed to the right edge of the row, not left against the gutter.

        The measure is capped at 58ch, so on a wide screen the prose used all of
        its 58 characters and then left the remaining third of the row empty on
        the *outside* — the heading pinned to the left margin, the text floating
        in the middle, and a void at the right. `ms-auto` spends that slack on
        the gutter between the two columns instead, so the section sits on both
        margins and what is left is space *between* the two things rather than a
        hole beside one of them.
      */}
      <div className="max-w-[58ch] min-w-0 flex-1 md:ms-auto">
        {section.paragraphs.map((paragraph, i) => (
          <p
            key={paragraph}
            className={cn(
              "font-sans leading-relaxed",
              i > 0 && "mt-5",
              // The opening paragraph a step up, the oldest trick in a magazine:
              // it marks where to start and makes the rest feel already moving.
              i === 0 ? "text-[1.0625rem] lg:text-xl" : "text-base lg:text-lg",
              lit ? "text-paper/70" : "text-soft",
            )}
          >
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}
