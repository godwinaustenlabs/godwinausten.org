import { Label } from "@/components/ui/Label";
import { Panel } from "@/components/ui/Panel";
import { Cell, NextCell } from "@/components/ui/Cell";
import { ScrollMorph } from "@/components/ui/ScrollMorph";
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
  cover,
  anchor,
  next,
  ...form
}: LeadMagnetProps) {
  return (
    <Panel
      id={anchor}
      className="grid-rows-[auto_auto_auto_auto] md:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] md:grid-rows-[auto_minmax(0,1fr)_auto]"
    >
      <div className="cell cell-ink col-span-full flex-row items-center gap-4 px-gutter py-3">
        <Label tone="paper" className="opacity-40">
          {index}
        </Label>
        <Label tone="paper" className="opacity-70">
          {eyebrow}
        </Label>
      </div>

      <Cell
        tone="ink"
        className="z-20 col-span-full [transform:translate3d(0,var(--block-lead,0px),0)] bg-ink will-change-transform md:col-span-1 strip:[transform:translate3d(var(--block-lead,0px),0,0)]"
        bodyClassName="justify-center gap-5"
      >
        <p className="font-mono text-xs tracking-[0.12em] text-signal uppercase">{kicker}</p>

        <h2 className="font-display text-[clamp(1.9rem,3.8vw,3.5rem)] leading-[0.94] font-bold">
          {headline}
        </h2>

        <p className="max-w-[34ch] font-sans text-base text-paper/65 lg:text-lg">{body}</p>

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

      <Cell
        tone="ink"
        className="relative col-span-full overflow-hidden md:col-span-1"
        bodyClassName="justify-center items-center"
      >
        {/*
          The lattice, behind the cover.

          The same morph the services section runs, on the viewport driver
          because this panel does not pin — the pin driver measures travel a
          panel exactly one screen wide does not have, and would hold the first
          frame forever.
        */}
        {/*
          `text-paper`, because the lattice draws in `currentColor` and its own
          default is ink — right on the paper sections it was built for, and
          invisible here, on the only ink panel of the page.
        */}
        <ScrollMorph
          drive="viewport"
          className="pointer-events-none absolute inset-0 text-paper opacity-45"
        />

        {/*
          The cover, as frosted glass over it.

          Not a real document image — a drawn one, with the title and the format
          on it, so the offer is a thing on the page rather than a sentence about
          a thing. Glass rather than a flat fill because there is something
          moving behind it worth seeing: the pane reads as an object lying on the
          panel instead of a rectangle drawn on it, and the motion still comes
          through where the type is not.
        */}
        <div
          aria-hidden="true"
          className="glass relative flex aspect-[3/4] w-full max-w-[16rem] flex-col justify-between rounded-lg p-6 sm:max-w-[18rem]"
        >
          <span className="h-1.5 w-10 rounded-full bg-signal" />
          <span className="font-display text-[clamp(1.15rem,1.8vw,1.6rem)] leading-[1.05] font-bold text-paper">
            {cover.title}
          </span>
          <Label tone="paper" className="opacity-60">
            {cover.format}
          </Label>
        </div>
      </Cell>

      <div className="cell col-span-full hidden md:flex">
        <NextCell next={next} tone="ink" />
      </div>
    </Panel>
  );
}
