import { Label } from "@/components/ui/Label";
import { Panel } from "@/components/ui/Panel";
import { Cell, MediaCell } from "@/components/ui/Cell";
import { Reel } from "@/components/ui/Reel";
import type { PageHeaderProps } from "./block.config";

/**
 * The masthead for a sub-route.
 *
 * Deliberately not a second hero. The home page's hero is the one place the
 * traced figure appears and the one place the display type runs to six rems;
 * repeating that on every route would spend the effect and make each page look
 * like a different attempt at the same landing page. Same type system, one step
 * quieter.
 *
 * A block rather than a layout component precisely so those pages stay
 * compositions and never grow markup of their own (CLAUDE.md §2.2).
 */
export default function PageHeader({
  eyebrow,
  headline,
  lead,
  meta,
  reel,
  photo,
}: PageHeaderProps) {
  return (
    <Panel className="relative grid-rows-[1fr_auto]">
      <Cell eyebrow={eyebrow} bodyClassName="relative justify-center gap-6">
        {/*
          The photograph, *inside* the cell.

          It used to be a panel-level layer at `-z-10`, which put it behind the
          panel's own background — and `grid-cells` paints that background
          hairline, because the seams between cells are a gap over a coloured
          ground. So the photograph was invisible and the headline sat on a bare
          grey slab the width of the page. Inside the cell it is over paper and
          under the type, which is what "knocked back" was always supposed to
          mean. The cell keeps its paper ground and the seams keep theirs.

          6%, not 13%. Once it was actually visible it turned out to be a
          high-contrast photograph of dark cable, and at 13% the printing on the
          cable was legible behind the headline. This is meant to warm the paper,
          not to be looked at.
        */}
        {photo ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.06] grayscale"
            style={{ backgroundImage: `url(${photo.src})` }}
          />
        ) : null}

        <h1 className="relative max-w-[16ch] font-display text-[clamp(2.25rem,6vw,6rem)] leading-[0.9] font-bold text-ink">
          {headline}
        </h1>
        {lead ? (
          <p className="relative max-w-[52ch] font-sans text-base text-soft lg:text-lg">{lead}</p>
        ) : null}
      </Cell>

      {reel ? (
        // 16:9, like every other video slot on the site. It was 21:9 — a cinema
        // crop applied to footage that is not shot that way, so the first thing
        // it would have done to a real cut was cut it.
        <MediaCell className="aspect-video w-full">
          {/*
            One `Reel` rather than a `<video>` here and a placeholder there. The
            hand-rolled pair this replaces had a `preload="none"` video with
            nothing to start it, so a masthead that finally got a `src` would
            have gone black.

            `playOn` is left at its default, which is hover. It used to be
            `"always"` on the grounds that a reel at the head of a page about one
            build is the subject of that page — but the reader arriving has not
            asked to watch anything yet, and a clip that starts itself on three
            separate routes is the site deciding for them. The still says what is
            there; pointing at it starts it.
          */}
          <Reel label={reel.runtime} src={reel.src} poster={reel.poster} />
        </MediaCell>
      ) : null}

      {meta.length > 0 ? (
        /*
          Columns from the *count*, not a guess.

          This was `md:grid-cols-3` against a list that is usually two items
          long, so every route rendered an empty third cell — a bare rectangle
          of seam-ground in the top corner that reads as something failing to
          load rather than as space.
        */
        <div
          /*
            One column on the narrowest phones.

            It was two at every width, and a half of a 320px screen is 160px —
            less than `jobs@godwinausten.org` needs. A mono address is a single
            unbreakable token, so it did not wrap or clip: it pushed the document
            27px wider than the viewport, which on a page with fixed chrome means
            the header and the nav rail stretch with it and the whole site
            scrolls sideways by 27px. One column below `sm` costs a row of height
            on the one size that has height to spare.
          */
          className="grid-cells grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[repeat(var(--meta-cols),minmax(0,1fr))]"
          style={{ "--meta-cols": meta.length } as React.CSSProperties}
        >
          {meta.map((item) => (
            <div key={item} className="cell min-w-0 justify-center px-gutter py-3.5">
              {/* `break-words` is the backstop: it costs nothing until a token
                  cannot fit at any width, and then it breaks rather than spills.
                  Meta is edited far more often than this file. */}
              <Label className="break-words">{item}</Label>
            </div>
          ))}
        </div>
      ) : null}
    </Panel>
  );
}
