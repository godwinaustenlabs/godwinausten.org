import { Label } from "@/components/ui/Label";
import { Panel } from "@/components/ui/Panel";
import { Cell, NextCell } from "@/components/ui/Cell";
import { ExperienceCard } from "./parts/ExperienceCard";
import type { ExperienceFeatureProps } from "./block.config";

/**
 * The proof panel: a claim, and one card that backs it.
 *
 * The experience used to take the whole panel — a headline the width of the
 * screen, a paragraph, a notes row, a call to action. One build does not need
 * that much room on a landing page, and at that scale the clip read as the
 * subject of the section rather than as evidence for it.
 *
 * Now the claim gets the left of the panel and the card sits beside it at
 * roughly a third the width, with a tile between them. The detail is on
 * `/work`, which is where the card goes.
 */
export default function ExperienceFeature({
  index,
  eyebrow,
  headline,
  lead,
  card,
  next,
}: ExperienceFeatureProps) {
  return (
    <Panel className="grid-rows-[auto_auto_auto] md:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] md:grid-rows-[auto_minmax(0,1fr)_auto]">
      <div className="cell col-span-full flex-row items-center gap-4 px-gutter py-3">
        <Label tone="ink" className="opacity-40">
          {index}
        </Label>
        <Label>{eyebrow}</Label>
      </div>

      <Cell className="col-span-full md:col-span-1" bodyClassName="justify-center gap-6">
        {/* The accent mark. A small square inside the cell, not a column of its
            own: as a grid child it stretched to the full row height and read as
            a highlighter stripe down the middle of the panel. */}
        <span aria-hidden="true" className="size-10 shrink-0 bg-signal" />

        <h2 className="font-display text-[clamp(1.9rem,4vw,4rem)] leading-[0.92] font-bold text-ink">
          {headline}
        </h2>
        <p className="max-w-[38ch] font-sans text-base text-soft lg:text-lg">{lead}</p>
      </Cell>

      <ExperienceCard {...card} />

      <div className="cell col-span-full">
        <NextCell next={next} />
      </div>
    </Panel>
  );
}
