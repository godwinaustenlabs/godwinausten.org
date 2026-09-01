import { preload } from "react-dom";
import { SiteLink } from "@/modules";
import { Label } from "@/components/ui/Label";
import { HeroFigure } from "./parts/HeroFigure";
import type { HeroScribbleProps } from "./block.config";

/**
 * The hero — the copy and the figure side by side.
 *
 * ## Why they are not overlapped
 *
 * The reference (`docs/inspiration/raw/01-mantis-hero-wide.jpg`) runs its
 * headline straight across the drawing, and that is the more striking
 * composition. It does not survive this drawing: the trace is dense and evenly
 * dark across the whole torso, so black type laid over it loses its
 * counters — "build" and "teams" stopped being readable at every size we tried.
 * The reference's figure is much sparser where its headline crosses.
 *
 * So: two columns, copy left, figure right, each with room. The overlap was
 * costing legibility on the one line the whole page depends on.
 *
 * ## Why there is no rule between them
 *
 * This is the only panel outside the cell grid, and a seam here would make it a
 * two-cell layout like every section below it. The hero's job is to be one
 * image; the change in density between the type and the drawing is the only
 * division it needs.
 */
export default function HeroScribble({
  headlineLines,
  subhead,
  primary,
  secondary,
  place,
  scrollHint,
  figure,
}: HeroScribbleProps) {
  // A CSS mask is not a resource the preload scanner can find — it is only
  // discovered once styles are computed, which on a cold load is late enough to
  // show an empty hero. This puts it on the critical path.
  preload(figure, { as: "image", fetchPriority: "high" });

  return (
    <div className="relative flex h-[var(--band)] w-full flex-col overflow-hidden md:flex-row md:items-stretch strip:h-full strip:w-screen">
      <div className="relative order-2 flex min-h-0 flex-1 flex-col justify-center px-gutter py-[clamp(1rem,3vh,2rem)] md:order-1 md:basis-[54%] lg:basis-[56%]">
        <h1 className="font-display text-[clamp(2rem,5.6vw,6rem)] leading-[0.88] font-bold text-ink">
          {headlineLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>

        {/* The sub-link, with a rule over it as in the reference. */}
        <p className="mt-5 w-fit border-t border-hairline pt-3 font-sans text-base text-soft md:mt-7 lg:text-lg">
          {subhead}
        </p>

        <div className="mt-[clamp(1.25rem,3.5vh,2.25rem)] flex flex-wrap items-center gap-x-8 gap-y-3">
          <SiteLink
            href={primary.href}
            className="signal-link font-sans text-base font-medium text-ink lg:text-lg"
          >
            {primary.label} <span aria-hidden="true">→</span>
          </SiteLink>
          <SiteLink href={secondary.href} className="signal-link font-sans text-base text-soft">
            {secondary.label}
          </SiteLink>
        </div>

        {/*
          Corner meta, taken out of the flow.
          
          As a flex child with `mt-auto` it absorbed all the free space and
          pushed the headline to the top of the column; absolutely positioned it
          sits at the foot while the copy stays optically centred. Both items
          live in this column so neither ends up over the drawing.
        */}
        <div className="absolute inset-x-[var(--gutter)] bottom-4 hidden items-center justify-between md:flex">
          <p className="flex items-center gap-4">
            <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-signal" />
            <Label>{place}</Label>
          </p>
          <Label>
            {scrollHint} <span aria-hidden="true">→</span>
          </Label>
        </div>
      </div>

      {/*
       * The figure's column. No border — the drawing's own edge is the
       * division. It bleeds off the bottom, which is what keeps it feeling like
       * a crop of something larger rather than a picture placed in a box.
       */}
      <div className="relative order-1 min-h-0 flex-1 md:order-2 md:basis-[46%] lg:basis-[44%]">
        <HeroFigure src={figure} className="opacity-90" />
      </div>
    </div>
  );
}
