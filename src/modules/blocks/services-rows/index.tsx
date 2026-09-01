import { Label } from "@/components/ui/Label";
import { Panel } from "@/components/ui/Panel";
import { Cell, NextCell } from "@/components/ui/Cell";
import { ScrollMorph } from "@/components/ui/ScrollMorph";
import type { ServicesRowsProps } from "./block.config";

/**
 * How it gets built — a pinned head with the offerings sliding past it.
 *
 * ## The pin
 *
 * The heading parks itself against the leading edge of the viewport while the
 * three cells travel past and disappear behind the ink bar at its trailing
 * edge. The section only moves on once all three have gone by, which is what
 * makes the comparison land: you read the question once and then get the three
 * answers against it, rather than reading a heading and then leaving it behind.
 *
 * It is one transform reading `--block-lead`, which `BlockFrame` publishes
 * (`layout.stickyHead`). The block measures nothing and does not know which
 * axis it is on: on the filmstrip the head holds still horizontally, in
 * vertical flow it holds still vertically, and the declaration is the same.
 *
 * `position: sticky` cannot do this — inside the filmstrip's transformed track
 * there is no scrollport for it to stick to, so it silently does nothing.
 *
 * ## The bar
 *
 * The ink column is not decoration. It gives the cells an edge to vanish behind
 * rather than sliding under a transparent heading, and it is what makes the
 * pinned group read as a fixed frame the content moves through.
 */
export default function ServicesRows({
  index,
  eyebrow,
  headline,
  rows,
  next,
  lattice,
}: ServicesRowsProps) {
  return (
    <Panel
      width={2}
      className="grid-rows-[auto_auto_1fr_auto] md:grid-cols-[minmax(0,0.8fr)_auto_repeat(3,minmax(0,1fr))] md:grid-rows-[auto_1fr_auto]"
    >
      <div className="cell col-span-full flex-row items-center gap-4 px-gutter py-3">
        <Label tone="ink" className="opacity-40">
          {index}
        </Label>
        <Label>{eyebrow}</Label>
      </div>

      {/*
        The pinned head. Opaque and above the cells, so they pass behind it.
        `--block-lead` is px travelled past the viewport's leading edge on
        whichever axis is live — Y in flow, X on the strip — so the axis is a
        class, not a runtime branch.
      */}
      <Cell
        className="z-20 col-span-2 [transform:translate3d(0,var(--block-lead,0px),0)] bg-paper will-change-transform md:col-span-1 strip:[transform:translate3d(var(--block-lead,0px),0,0)]"
        bodyClassName={lattice ? "justify-between gap-6" : "justify-end"}
      >
        {/* The lattice, in the space above the headline: a stack of dots that
            becomes a cube, a knot, then a network. It runs on the *pin* — it
            starts when the head catches the edge and finishes as it lets go, so
            every phase happens while the heading is stuck and visible. */}
        {lattice ? <ScrollMorph className="min-h-0 flex-1" /> : null}

        <h2 className="shrink-0 font-display text-[clamp(1.85rem,3.2vw,3.25rem)] leading-[0.95] font-bold text-ink">
          {headline}
        </h2>
      </Cell>

      {/* The bar the cells slide into. Pinned with the head, above them. */}
      <div
        aria-hidden="true"
        className="z-20 hidden [transform:translate3d(0,var(--block-lead,0px),0)] bg-ink will-change-transform md:block md:w-10 strip:[transform:translate3d(var(--block-lead,0px),0,0)]"
      />

      {rows.map((row) => (
        <Cell key={row.index} eyebrow={row.title} index={row.index} bodyClassName="justify-end">
          <p className="max-w-[32ch] font-sans text-base leading-relaxed text-soft">{row.detail}</p>
        </Cell>
      ))}

      <div className="cell col-span-full">
        <NextCell next={next} />
      </div>
    </Panel>
  );
}
