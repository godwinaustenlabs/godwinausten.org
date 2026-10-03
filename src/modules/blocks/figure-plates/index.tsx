import { Panel } from "@/components/ui/Panel";
import { Cell, MediaCell } from "@/components/ui/Cell";
import { cn } from "@/lib/utils";
import type { FigurePlatesProps } from "./block.config";

/**
 * A band of figures, top to bottom, and one line under it.
 *
 * ## What it is for
 *
 * The funnel runs paper from the hero to the footer, and seven panels of the
 * same ground in a row is the monotony this breaks. One panel, in the middle of
 * the page, where the argument can afford a breath.
 *
 * It is deliberately **not a numbered section**: no index, no eyebrow, so it
 * never joins the running order and the chain from "what we offer" to the ask is
 * the same length it was. A reader travelling the filmstrip meets it as a
 * breath, not as a step they have to take. It still says something — an
 * atmospheric panel that means nothing is a slow screen with pictures on it.
 *
 * ## Why the pictures are cells and not a blended layer
 *
 * A previous cut floated them on the ink with `mix-blend-mode: screen`, on the
 * reasoning that a black source pixel contributes nothing, so the rectangle
 * would vanish and only the lit figure would show.
 *
 * **That only works if the file's black is actually black.** These are grainy,
 * lifted-black photographs: screen over `--color-ink` pushed their ground
 * *above* the panel's, and the result was a pale grey rectangle in the middle of
 * a dark panel — the exact frame the trick existed to remove, now lighter than
 * its surroundings.
 *
 * So each is a **cell**, full-bleed, running the whole height of the band and
 * butting its neighbour on the grid's one-pixel seam. That is the site's own
 * language — `contact-footer` and the experience masthead both do it — and it
 * needs no blend to be honest, because a cell that runs to the panel edge is not
 * a framed object. Three of them read as a triptych rather than as three
 * pictures somebody placed.
 *
 * ## The last one drops full height
 *
 * The first two sit in the band with the type under them; the last spans both
 * rows and runs the whole height of the panel. That is partly composition — a
 * row of three equal rectangles with a caption bar under it is a contact sheet,
 * and the tall column on the end turns it into a layout — and partly the
 * pictures: the third is a portrait, and in a band sized for a landscape it was
 * the one being cropped hardest.
 *
 * `bg-cover`, so each fills its column whatever its own ratio: these arrive as a
 * landscape, a square and a portrait, and any attempt to respect three ratios in
 * one band produces three different-sized holes.
 */
export default function FigurePlates({ plates, headline, body }: FigurePlatesProps) {
  const last = plates.length - 1;
  const wide = plates.length === 3;

  return (
    <Panel
      /*
        A stack below `md`; above it, a column per picture with a row of type
        under all but the last.

        Placement is left to the grid's own auto-flow rather than spelled out per
        cell: the pictures take the first row in order, the last one claims two
        rows as it goes, and the type cell lands in the only space left — row
        two, under the others. Saying that explicitly would be four sets of
        coordinates that have to be kept in step with a count.
      */
      className={cn(wide ? "md:grid-cols-3" : "md:grid-cols-2", "md:grid-rows-[1fr_auto]")}
    >
      {plates.map((plate, i) => (
        <MediaCell
          key={plate.src}
          className={cn("min-h-[34svh] md:min-h-0", i === last && "md:row-span-2")}
        >
          <div
            aria-hidden="true"
            /*
              Decorative. There is no alternative text for these that is not
              either a description of a mood or a repeat of the headline printed
              under them, and a screen reader is better served by neither.
            */
            className="size-full bg-cover bg-center"
            style={{ backgroundImage: `url(${plate.src})` }}
          />
        </MediaCell>
      ))}

      <Cell
        tone="ink"
        className={cn(wide ? "md:col-span-2" : "md:col-span-1")}
        bodyClassName="justify-center gap-5 py-[clamp(1.75rem,5vh,3rem)]"
      >
        {/* The accent rule. This panel has no index bar, so it is the only mark
            saying a new thing has started. */}
        <span aria-hidden="true" className="block h-1.5 w-12 bg-signal" />
        <h2 className="max-w-[20ch] font-display text-[clamp(1.8rem,4.2vw,3.75rem)] leading-[0.95] font-bold text-paper">
          {headline}
        </h2>
        <p className="max-w-[56ch] font-sans text-base leading-relaxed text-paper/70 lg:text-lg">
          {body}
        </p>
      </Cell>
    </Panel>
  );
}
