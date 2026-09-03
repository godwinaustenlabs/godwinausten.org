import { Label } from "@/components/ui/Label";
import { Panel } from "@/components/ui/Panel";
import { Cell } from "@/components/ui/Cell";
import type { AboutStatementProps } from "./block.config";

/**
 * A statement, on ink.
 *
 * The seam block. It is the only ink panel on a sub-route, so colour carries
 * across the boundary instead of the page resetting to paper at every section —
 * the thing that stops a scroll reading as a stack of repeated templates
 * (docs/inspiration/raw/03-oddcommon-reach-out.png).
 *
 * The meta line is plain text, not a stat block. There are no manufactured
 * numbers anywhere on this site.
 */
export default function AboutStatement({
  index,
  eyebrow,
  headline,
  body,
  meta,
}: AboutStatementProps) {
  return (
    <Panel className={meta ? "grid-rows-[1fr_auto]" : "grid-rows-[1fr]"}>
      <Cell eyebrow={eyebrow} index={index} tone="ink" bodyClassName="justify-center gap-7">
        <h2 className="max-w-[18ch] font-display text-[clamp(2rem,5vw,4.75rem)] leading-[0.92] font-bold">
          {headline}
        </h2>
        <p className="max-w-[52ch] font-sans text-base leading-relaxed text-paper/70 lg:text-lg">
          {body}
        </p>
      </Cell>

      {meta ? (
        <div className="cell cell-ink flex-row items-center gap-3 px-gutter py-3.5">
          {/* The lime dot — one of the two places the accent appears. */}
          <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-signal" />
          <Label tone="paper" className="opacity-70">
            {meta}
          </Label>
        </div>
      ) : null}
    </Panel>
  );
}
