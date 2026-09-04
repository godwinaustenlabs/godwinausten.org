"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * The traced figure, leaning toward the pointer and drifting on scroll.
 *
 * ## Two layers of one asset
 *
 * The same SVG is painted twice, at slightly different scales and opacities,
 * moving at different rates. That reads as depth — a flat drawing sliding
 * around on its own just looks like a sticker.
 *
 * An earlier version cut the trace into three separate depth-plane files. It
 * could not work: `fill-rule: evenodd` renders the holes inside every loop of
 * the scribble by cancelling them against the contour that encloses them, and
 * that only holds if all of them are in the same path. Split across files, the
 * hand filled in as a solid blob. Two layers of one file cost one fetch,
 * because the second is the same cached URL.
 *
 * Painted as a CSS mask rather than inline SVG: 170 KB of path data in the HTML
 * would sit on the critical path of the one page that has to sell, and as a
 * mask the browser caches it and the drawing still takes `currentColor`.
 *
 * One rAF loop writes two numbers onto the root; the layers are pure CSS off
 * those, so pointer tracking costs one style write per frame and React never
 * re-renders.
 */

/** Each layer's travel in px at full pointer deflection, scale, and opacity. */
const LAYERS = [
  // A faint, slightly larger ghost behind the drawing. Kept low: any more and
  // the offset reads as a printing misregistration rather than as depth.
  { depth: 6, scale: 1.03, opacity: 0.16, paint: "currentColor" },
  { depth: 24, scale: 1, opacity: 1, paint: "currentColor" },
  /*
   * A third pass, in colour, at the same depth as the drawing.
   *
   * The trace is one path and it is painted through a mask, so there is no way
   * to reach *individual* strokes — but there is no need to. Laying a gradient
   * over the ink at the same offset and scale tints whole regions of the figure,
   * and because the scribble is a tangle, what comes out is bands of coloured
   * line running through black ones. That is the effect the owner asked for and
   * it costs one more masked element: no second file, no per-stroke geometry,
   * and it inherits the same pointer and scroll transform so it never separates
   * from the drawing under it.
   *
   * Partial opacity because the ink beneath is near-black: full strength would
   * simply replace the drawing with a gradient, and the point is a figure that
   * has colour in it rather than a coloured figure.
   */
  {
    depth: 24,
    scale: 1,
    opacity: 0.62,
    paint:
      "linear-gradient(148deg, #c6ff3e 0%, #7fd8b0 18%, transparent 34%, transparent 46%, #6fb7e8 58%, #b39ae0 68%, transparent 78%, #f08d7a 92%, #f3c05a 100%)",
  },
] as const;
/** Pointer smoothing. Lower is heavier — the figure should lag the cursor. */
const EASE = 0.07;
/** Below this the loop parks itself and waits for the next pointer move. */
const SETTLE = 0.0004;

export interface HeroFigureProps {
  src: string;
  className?: string;
}

export function HeroFigure({ src, className }: HeroFigureProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // Two gates, both meaning "do not track the pointer": the visitor asked for
    // reduced motion, or there is no pointer. On a phone the listener would
    // never fire, and a touch drag reading as cursor movement is worse than
    // nothing.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(pointer: fine)");

    let frame = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    function tick() {
      frame = 0;
      currentX += (targetX - currentX) * EASE;
      currentY += (targetY - currentY) * EASE;

      root!.style.setProperty("--pointer-x", currentX.toFixed(4));
      root!.style.setProperty("--pointer-y", currentY.toFixed(4));

      const settled =
        Math.abs(targetX - currentX) < SETTLE && Math.abs(targetY - currentY) < SETTLE;
      if (!settled) frame = requestAnimationFrame(tick);
    }

    function onPointerMove(event: PointerEvent) {
      // -1 → 1 across the viewport, so the lean does not depend on screen size.
      targetX = (event.clientX / window.innerWidth) * 2 - 1;
      targetY = (event.clientY / window.innerHeight) * 2 - 1;
      if (!frame) frame = requestAnimationFrame(tick);
    }

    function onPointerLeave() {
      // Settle back to centre rather than freezing where the cursor left.
      targetX = 0;
      targetY = 0;
      if (!frame) frame = requestAnimationFrame(tick);
    }

    function detach() {
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
    }

    function attach() {
      detach();
      if (reduce.matches || !fine.matches) {
        targetX = 0;
        targetY = 0;
        currentX = 0;
        currentY = 0;
        root!.style.setProperty("--pointer-x", "0");
        root!.style.setProperty("--pointer-y", "0");
        return;
      }
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.addEventListener("pointerleave", onPointerLeave);
    }

    attach();
    reduce.addEventListener("change", attach);
    fine.addEventListener("change", attach);

    return () => {
      detach();
      reduce.removeEventListener("change", attach);
      fine.removeEventListener("change", attach);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 text-ink",
        /*
         * Two different jobs at two different shapes.
         *
         * Wide, the drawing sits in a tall column beside the copy: it is scaled
         * to `contain` inside a box 8% taller than that column and anchored to
         * the floor, so it overflows the top and bleeds — a crop of something
         * larger rather than a picture placed in a box.
         *
         * Narrow, it is stacked *above* the copy, and the 8% overflow clips the
         * raised hand against the top of the hero. So the overflow goes and the
         * box is 95% of its column, which is also the margin the owner asked for
         * over the drawing.
         *
         * `contain` at both shapes, and the mask is anchored `center bottom`,
         * which is what makes that safe. `auto 100%` was here for a while — it
         * fills the column's height, and when the column was short that was the
         * only way to avoid a band of empty paper under the figure. Once the
         * copy stopped absorbing the band's slack the column became tall, and
         * filling *that* height pushed the drawing wider than the phone: the
         * raised hand went off one edge and the low arm off the other. Fitting
         * by width and sitting on the floor puts any slack above the figure,
         * where it reads as air under the nav rather than as a hole in the page.
         */
        /*
          The 5% on a phone is a top margin, taken as height.

          The box is anchored to the floor, and its height is what the drawing is
          scaled against — so 95% of the column both lets the figure down off the
          top edge and keeps it meeting the copy underneath with no gap. A `top`
          would have done the first without the second, and `mt` nothing at all:
          an absolutely positioned box with `bottom-0` and a height ignores it.
        */
        "h-[95%] [--figure-mask-size:contain] md:h-[108%]",
        className,
      )}
      style={{ "--pointer-x": 0, "--pointer-y": 0 } as React.CSSProperties}
    >
      {LAYERS.map((layer, i) => (
        <span
          key={i}
          data-layer={i}
          className="absolute inset-0 block will-change-transform"
          style={
            {
              // `--block-progress` is published by BlockFrame and is the scroll
              // half of the movement; the pointer is the other half.
              opacity: layer.opacity,
              transform: `translate3d(
                calc(
                  var(--pointer-x) * ${layer.depth}px +
                  (0.5 - var(--block-progress, 0.5)) * var(--block-depth, 0) * ${layer.depth * 4}px
                ),
                calc(var(--pointer-y) * ${layer.depth * 0.5}px),
                0
              ) scale(${layer.scale})`,
              WebkitMaskImage: `url(${src})`,
              maskImage: `url(${src})`,
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center bottom",
              maskPosition: "center bottom",
              WebkitMaskSize: "var(--figure-mask-size)",
              maskSize: "var(--figure-mask-size)",
              // A colour for the ink passes, a gradient for the colour one.
              background: layer.paint,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
