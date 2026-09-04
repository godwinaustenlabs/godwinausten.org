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
      className="grid-rows-[auto_auto_auto_auto] md:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] md:grid-rows-[auto_minmax(0,1fr)_auto]"
    >
      <div className="cell col-span-full flex-row items-center gap-4 px-gutter py-3">
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
        className="z-20 col-span-full [transform:translate3d(0,var(--block-lead,0px),0)] bg-paper will-change-transform md:col-span-1 strip:[transform:translate3d(var(--block-lead,0px),0,0)]"
        bodyClassName="justify-center gap-5"
      >
        {/* Lime on paper is a highlighter, not a colour to set type in. */}
        <p className="font-mono text-xs font-medium tracking-[0.12em] text-ink/70 uppercase">
          {kicker}
        </p>

        <h2 className="font-display text-[clamp(1.9rem,3.8vw,3.5rem)] leading-[0.94] font-bold text-ink">
          {headline}
        </h2>

        <p className="max-w-[34ch] font-sans text-base text-soft lg:text-lg">{body}</p>

        {/*
          The button lives with the offer, not beside the cover.

          A three-bullet contents list used to sit here. It was answering a
          question nobody asks of something free: the kicker says the price and
          the headline says what it is, and everything after that is reading
          between a visitor and a download they have already decided on. What is
          left is one claim, one line, one control.
        */}
        <div className="mt-1 w-full max-w-[24rem]">
          <PlaybookForm {...form} />
        </div>
      </Cell>

      {/*
        The mark's cell is paper too now, at the owner's call — the panel is one
        ground from edge to edge, and the mark is the only colour on it.
      */}
      <Cell
        className="relative col-span-full overflow-hidden md:col-span-1"
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

      <div className="cell col-span-full hidden md:flex">
        <NextCell next={next} />
      </div>
    </Panel>
  );
}
