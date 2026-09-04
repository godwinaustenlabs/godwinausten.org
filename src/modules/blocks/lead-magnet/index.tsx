import { Label } from "@/components/ui/Label";
import { Panel } from "@/components/ui/Panel";
import { Cell, NextCell } from "@/components/ui/Cell";
import { ChromeMark } from "./parts/ChromeMark";
import { PlaybookForm } from "./parts/PlaybookForm";
import type { LeadMagnetProps } from "./block.config";

/**
 * The ask.
 *
 * ## What was wrong with it
 *
 * It read as another content section. The offer was a mono eyebrow the size of
 * a caption, the field was a hairline underline, and the button was text. A
 * visitor scanning the page had to *work out* that something was being given
 * away — and a lead magnet that needs deciphering is not a magnet.
 *
 * Four things fix it, and all four are about making the offer legible in one
 * glance:
 *
 *  - **A cover.** The guide is drawn as an object with a title and a format, so
 *    it reads as a thing you receive rather than as a promise.
 *  - **The kicker says the price.** "Free, and actually useful" is the first
 *    line, in the accent, at size.
 *  - **The button is a filled lime block.** It is the only filled accent on the
 *    page and the loudest thing on the panel, which is correct — this is the
 *    page's one conversion.
 *  - **Less to read.** Three bullets, one paragraph, one field.
 *
 * ## Why the whole panel is ink
 *
 * It is the only ink panel on the page. Everything else is paper, so the eye
 * arrives here whether the visitor was reading or skimming.
 *
 * ## Why it does not pin, and is exactly one screen wide
 *
 * Pinning was tried and removed. A pinned offer column means the panel has to
 * be wider than the screen for the pin to have anywhere to travel, which pushes
 * the field off the edge on arrival — and this is the one section where the
 * reader should land on the thing they are meant to do. An anchor puts a
 * panel's leading edge at the viewport's leading edge; at exactly one screen
 * wide, that means the whole offer and the whole form, at once, with no
 * discovery step.
 */
export default function LeadMagnet({
  index,
  eyebrow,
  kicker,
  headline,
  body,
  anchor,
  next,
  ...form
}: LeadMagnetProps) {
  return (
    <Panel
      id={anchor}
      /*
        The mark takes the left column and the offer the right.

        The *order in the document* is unchanged — the offer still comes first,
        which is the order it is read in on a phone and the order that matters
        for the one conversion on the page. Only the placement moves, and only
        from `md` up, where there are two columns for it to move between. Doing
        it with `order` rather than by swapping the JSX is what keeps those two
        facts independent.
      */
      className="grid-rows-[auto_auto_auto_auto] md:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] md:grid-rows-[auto_minmax(0,1fr)_auto]"
    >
      <div className="cell col-span-full flex-row items-center gap-4 px-gutter py-3 md:order-1">
        <Label tone="ink" className="opacity-40">
          {index}
        </Label>
        <Label className="opacity-90">{eyebrow}</Label>
      </div>

      {/*
        The offer sits on paper, like everything else on the site.

        It was an ink block, and the mark's cell beside it still is — which is
        the point: the dark is now a frame for the one coloured thing on the
        panel rather than the ground the reader has to do their reading on. The
        explicit `bg-paper` is not redundant; this cell is lifted by
        `--block-lead` and has to be opaque as it travels over the one behind it.
      */}
      <Cell
        /*
          Ink, with the offer in paper.

          Two coloured grounds were tried here and both are recorded in the
          history rather than in the file: pine, and the accent let down into
          paper. Each solved the complaint that white makes this one more section
          in a column of white sections, and the owner's landing point is that a
          black panel does it better — the offer is the one thing on the page
          being *given away*, and it reads as an object when the page around it
          goes dark rather than as a louder version of the same page.

          `bg-ink` is explicit as well as `tone`: the cell travels on
          `--block-lead` and has to be opaque as it passes over the panel behind.
        */
        tone="ink"
        className="z-20 col-span-full [transform:translate3d(0,var(--block-lead,0px),0)] bg-ink will-change-transform md:order-3 md:col-span-1 strip:[transform:translate3d(var(--block-lead,0px),0,0)]"
        bodyClassName="justify-center gap-5"
      >
        <p className="font-mono text-xs font-medium tracking-[0.12em] text-paper/65 uppercase">
          {kicker}
        </p>

        <h2 className="font-display text-[clamp(1.9rem,3.8vw,3.5rem)] leading-[0.94] font-bold text-paper">
          {headline}
        </h2>

        {/* `soft` is a grey mixed for paper and goes muddy on anything else. */}
        <p className="max-w-[34ch] font-sans text-base text-paper/70 lg:text-lg">{body}</p>

        {/*
          The button lives with the offer, not beside the cover.

          A three-bullet contents list used to sit here. It was answering a
          question nobody asks of something free: the kicker says the price and
          the headline says what it is, and everything after that is reading
          between a visitor and a download they have already decided on. What is
          left is one claim, one line, one control.
        */}
        {/*
          Set down from the copy rather than tucked under it.

          The cell is a `gap-5` stack, and at that spacing the control read as
          the last line of the paragraph. The extra top margin is what makes it
          a separate object on the panel — something you press, rather than
          something you finish reading.
        */}
        <div className="mt-6 w-full max-w-[24rem] sm:mt-9">
          <PlaybookForm {...form} />
        </div>
      </Cell>

      {/*
        The mark's cell is paper too now, at the owner's call — the panel is one
        ground from edge to edge, and the mark is the only colour on it.
      */}
      <Cell
        className="relative col-span-full overflow-hidden md:order-2 md:col-span-1"
        bodyClassName="items-center justify-center"
      >
        {/*
          The mark, and nothing else.

          A drawn "cover" used to sit here — a rectangle with the guide's title
          and format on it, standing in for a PDF. The owner cut it, and rightly:
          it was an imitation of a document rather than a document, the title and
          format are already said in the copy beside it, and a fake artefact next
          to a real download undercuts the download.

          What is left is the brand as an object: the same mark the loader draws
          and the favicon crops, given an iridescent surface
          (`npm run gen:chrome-mark`) and cut into its three shapes, each of
          which backs away from the pointer under its own weight. The colour is
          baked into the files, so all that ships to the browser is the arithmetic
          that moves them.
        */}
        <div
          /*
            Bound by the *cell's* height, not by an aspect ratio.

            A box given the mark's own proportions is very tall, and on any panel
            shorter than it the bottom simply went past the cell's edge and was
            clipped. `bg-contain` never crops what it paints, so the honest fix
            is to stop the box being taller than the space: a share of the height
            and a share of the width, and the drawing fits itself inside whatever
            that comes out as.
          */
          className="h-[82%] max-h-[30rem] w-full max-w-[26rem]"
        >
          <ChromeMark />
        </div>
      </Cell>

      <div className="cell col-span-full hidden md:order-4 md:flex">
        <NextCell next={next} />
      </div>
    </Panel>
  );
}
