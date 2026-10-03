import { Label } from "@/components/ui/Label";
import { Panel } from "@/components/ui/Panel";
import { Cell, NextCell } from "@/components/ui/Cell";
import type { FigureStatementProps } from "./block.config";

/**
 * A claim, and the tangle figure printed beside it.
 *
 * ## Why this is not the hero
 *
 * The hero owns the figure whole: the full standing drawing, anchored to the
 * floor of the page, leaning at the cursor, with a gradient running through the
 * ink. That composition is the landing page's and repeating it on a sub-route
 * would spend it — every page would look like another attempt at the same
 * opening.
 *
 * This is the same drawing under a different treatment, and the difference is
 * the point:
 *
 * - **Mirrored and tilted.** It reaches into the copy beside it rather than off
 *   the page edge, and a few degrees of rotation stop the mirror reading as a
 *   flipped copy of the drawing on `/`. It is shown whole, inside its cell —
 *   the hero is the page that bleeds its figure off the edge, and doing it
 *   twice would be one effect rather than two drawings.
 * - **Overprinted, not tinted.** Two flat passes a few pixels apart — lime under
 *   ink — which is the misregistration the Labs watermark is built out of, at
 *   figure scale. The hero's gradient stays the hero's.
 * - **No pointer, no JavaScript.** The hero runs a rAF loop to lean at the
 *   cursor. This is a server component with two masked `div`s in it; its only
 *   movement is the drift the frame already publishes as `--block-progress`.
 *
 * **A genuinely different pose would need a different source.** The drawing is
 * traced from one photograph (`docs/adr/0004`), and generating an original
 * figure was tried three times and rejected — a procedural scribble can be made
 * to look like a person but not like a drawn one. Until there is a second image
 * to trace, re-framing and re-inking the one we have is the honest version of
 * "the same idea, not the same picture".
 */
export default function FigureStatement({
  index,
  eyebrow,
  headline,
  body,
  figure,
  points,
  next,
}: FigureStatementProps) {
  return (
    <Panel
      width={1}
      className="grid-rows-[auto_auto_auto] md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:grid-rows-[auto_1fr_auto]"
    >
      <div className="cell col-span-full flex-row items-center gap-4 px-gutter py-3">
        <Label tone="ink" className="opacity-40">
          {index}
        </Label>
        <Label>{eyebrow}</Label>
      </div>

      <Cell
        className="col-span-full md:col-span-1"
        bodyClassName="justify-center gap-[clamp(1.5rem,4vh,2.5rem)]"
      >
        <h2 className="max-w-[15ch] font-display text-[clamp(2.1rem,4.6vw,4.5rem)] leading-[0.92] font-bold text-ink">
          {headline}
        </h2>
        <p className="max-w-[46ch] font-sans text-base leading-relaxed text-soft lg:text-lg">
          {body}
        </p>

        {/*
          The list is a `dl`, not three divs.

          Each row is a term and what it means, which is what a description list
          is for — and it is the difference between a screen reader announcing
          three headings with orphaned sentences and announcing three pairs.
        */}
        <dl className="flex flex-col border-t border-hairline">
          {points.map((point) => (
            <div
              key={point.index}
              className="flex flex-col gap-1.5 border-b border-hairline py-3.5 sm:flex-row sm:items-baseline sm:gap-5"
            >
              <dt className="flex shrink-0 items-baseline gap-3 sm:w-[13rem]">
                <Label tone="ink" className="opacity-30">
                  {point.index}
                </Label>
                <Label tone="ink" className="font-medium">
                  {point.title}
                </Label>
              </dt>
              <dd className="font-sans text-sm leading-relaxed text-soft">{point.detail}</dd>
            </div>
          ))}
        </dl>
      </Cell>

      {/*
        The drawing's cell.

        A floor below `md`, where the cell is only as tall as it is told to be.
        `contain` fits the mask to whichever side runs out first, so in a cell
        with no height to speak of the figure would resolve to a sliver and read
        as a smudge. Above `md` the cell is a real column of the panel and takes
        its height from the row, so the floor comes off.
      */}
      <div className="cell relative col-span-full min-h-[clamp(16rem,52vw,26rem)] overflow-hidden md:col-span-1 md:min-h-0">
        <FigurePrint src={figure} />
      </div>

      {next ? (
        <div className="cell col-span-full hidden md:flex">
          <NextCell next={next} />
        </div>
      ) : null}
    </Panel>
  );
}

/**
 * The figure, printed twice.
 *
 * Both passes are the same cached SVG painted as a mask, so the second costs no
 * fetch — the browser already has the file and the element is a coloured box
 * with a stencil over it. The lime pass sits up and to the left of the ink one
 * and is the only colour in the panel; kept well under full strength, because a
 * lime figure with a black one behind it is two drawings, and a black figure
 * with lime showing along one side of every stroke is a print.
 *
 * `--block-progress` is the frame's scroll fraction (0→1 as the section crosses
 * the viewport). Each pass drifts by a different multiple of it, so the offset
 * between them opens and closes as the reader scrolls — the same misregistration
 * the Labs watermark fakes with static offsets, except this one breathes. Under
 * `prefers-reduced-motion` the frame simply stops publishing movement and the
 * two hold where they are, which is still a print.
 */
function FigurePrint({ src }: { src: string }) {
  /** Each pass: its paint, its static offset, and how far it drifts on scroll. */
  const PASSES = [
    { paint: "var(--color-signal)", x: -14, y: -10, drift: 26, opacity: 0.9 },
    { paint: "var(--color-ink)", x: 0, y: 0, drift: 10, opacity: 1 },
  ];

  return (
    <div
      aria-hidden="true"
      /*
        Mirrored and tilted, and that is the whole re-pose.

        The hero's figure reaches up and to the left; mirrored it reaches up and
        to the right, which is *into* the copy beside it rather than away off the
        page edge. The few degrees of rotation stop the mirror reading as a
        mirror — a drawing flipped on a dead-straight axis looks like the same
        drawing backwards, and tilted it simply looks like a different one.

        Inset rather than flush to the cell, because rotating a box that exactly
        fills its parent pushes its corners outside it — and the cell clips. The
        inset is the turning circle, and it doubles as the margin that keeps the
        figure off the seam on every side.
      */
      className="pointer-events-none absolute inset-[5%] [transform-origin:center] [transform:scaleX(-1)_rotate(-5deg)]"
    >
      {PASSES.map((pass) => (
        <span
          key={pass.paint}
          className="absolute inset-0 block will-change-transform"
          style={
            {
              opacity: pass.opacity,
              background: pass.paint,
              transform: `translate3d(
                ${pass.x}px,
                calc(${pass.y}px + (0.5 - var(--block-progress, 0.5)) * ${pass.drift}px),
                0
              )`,
              WebkitMaskImage: `url(${src})`,
              maskImage: `url(${src})`,
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              /*
                Whole and centred, at the owner's call.

                It was cropped first — scaled to 155% of the cell and anchored to
                the top, so the reach filled the frame and the rest left through
                the bottom edge. That is a good device and it was the wrong one
                here: the hero already bleeds its figure off the page, and a
                second cropped figure on a sub-route reads as the same effect
                twice rather than as a different drawing.

                `contain` fits the whole thing inside the box at whichever side
                runs out first, so the figure is complete at every width and the
                mirror and the tilt carry the difference on their own.
              */
              WebkitMaskPosition: "center",
              maskPosition: "center",
              WebkitMaskSize: "contain",
              maskSize: "contain",
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
