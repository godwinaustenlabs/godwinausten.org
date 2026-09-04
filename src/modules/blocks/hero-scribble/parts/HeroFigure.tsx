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
  { depth: 6, scale: 1.03, opacity: 0.16 },
  { depth: 24, scale: 1, opacity: 1 },
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
         * Narrow, it is stacked *above* the copy in a short, wide column, and
         * both halves of that go wrong. The 8% overflow clips the raised hand
         * against the top of the hero, and `contain` on a box wider than the
         * drawing's own near-square aspect fits by width and leaves a band of
         * empty paper under the figure — read together as "the drawing is cut
         * and there is a hole beneath it", which is exactly what it looks like.
         * `auto 100%` fills the column's height instead, so the drawing meets
         * the copy with no gap, and the full height means nothing is clipped.
         */
        "h-full [--figure-mask-size:auto_100%] md:h-[108%] md:[--figure-mask-size:contain]",
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
              backgroundColor: "currentColor",
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
