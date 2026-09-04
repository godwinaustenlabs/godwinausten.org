"use client";

import { useEffect, useRef } from "react";
import { MARK_CHROME_ASPECT, MARK_CHROME_PARTS } from "@/components/layout/mark-chrome-parts";

/**
 * The mark, in pieces, backing away from the pointer.
 *
 * Each of the three shapes is painted from its own file (`npm run gen:chrome-mark`)
 * and each is pushed along the line running from the pointer to its own centre —
 * so the mark does not slide as a unit, it comes apart in the direction the
 * pointer is coming from and settles back when it leaves. The pieces are
 * magnets facing the wrong way round.
 *
 * ## Why the position is measured every frame
 *
 * The obvious implementation reads the pointer on `pointermove` and does nothing
 * in between, which is wrong on this site specifically: the panel it sits on
 * travels. On the home page the whole composition slides horizontally as you
 * scroll, so the mark can pass *under* a pointer that has not moved at all, and
 * a pointer-driven effect would sit frozen while the thing it is repelling
 * walks through it.
 *
 * So the loop asks where the mark is on every frame rather than caching it, and
 * the distance is between two things that are both allowed to move. It costs one
 * `getBoundingClientRect` a frame, and the loop only runs while the mark is on
 * screen.
 *
 * ## The fit
 *
 * The three files share the whole mark's box, so stacking them at one size
 * reassembles it — but `contain` letterboxes that box inside whatever the cell
 * gives it, and the parts' centres are fractions of the *painted* mark, not of
 * the cell. The loop redoes the contain fit itself, which is also what makes the
 * whole thing responsive: nothing here has a pixel in it.
 */
export function ChromeMark() {
  const box = useRef<HTMLDivElement>(null);
  const layers = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const boxEl = box.current;
    if (!boxEl) return;

    // A pointer that cannot hover cannot repel anything. The mark still paints;
    // it simply sits still, which is what it did before any of this.
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Off screen, there is nothing to react to and no reason to hold a frame
    // loop open — the same bargain the reel makes with its own observer.
    let running = false;
    let frame = 0;
    let last = performance.now();

    // Off screen to start with, so nothing is repelled before the pointer has
    // ever been seen.
    let pointerX = Number.NEGATIVE_INFINITY;
    let pointerY = Number.NEGATIVE_INFINITY;

    const offsets = MARK_CHROME_PARTS.map(() => ({ x: 0, y: 0 }));

    const draw = (now: number) => {
      const dt = Math.min(now - last, 64);
      last = now;

      const rect = boxEl.getBoundingClientRect();

      /*
       * The contain fit, redone here.
       *
       * `background-size: contain` centres the mark's box inside the cell and
       * leaves the rest as air. The parts' centres are fractions of that box,
       * not of the cell, so measuring against the cell would put every centre
       * in the wrong place on any cell that is not exactly the mark's shape.
       */
      const paintedW = Math.min(rect.width, rect.height * MARK_CHROME_ASPECT);
      const paintedH = paintedW / MARK_CHROME_ASPECT;
      const originX = rect.x + (rect.width - paintedW) / 2;
      const originY = rect.y + (rect.height - paintedH) / 2;

      // How near the pointer has to be before anything happens, and how far a
      // part is willing to go. Both scale with the mark, so the effect is the
      // same gesture on a phone-sized panel and on a wide one.
      const reach = Math.max(paintedW, paintedH) * 0.62;

      for (const [i, part] of MARK_CHROME_PARTS.entries()) {
        const layer = layers.current[i];
        const offset = offsets[i];
        if (!layer || !offset) continue;

        const px = originX + part.cx * paintedW;
        const py = originY + part.cy * paintedH;
        const dx = px - pointerX;
        const dy = py - pointerY;
        const distance = Math.hypot(dx, dy) || 1;

        /*
         * Squared falloff, not linear.
         *
         * Linear gives every part a constant nudge the moment the pointer is
         * anywhere in range, and the mark reads as loose rather than as
         * repelled. Squared keeps it still until the pointer is genuinely close
         * and then moves it quickly, which is how a magnet behaves.
         */
        const near = distance < reach ? 1 - distance / reach : 0;
        // A part travels in proportion to its own size: the dot is a full stop
        // and should not swing as far as the shape it sits over.
        const travel = near * near * paintedW * (0.1 + part.w * 0.14);

        /*
         * Out of range means *zero*, not "the direction, times zero".
         *
         * Before the pointer has ever been seen it is at negative infinity, and
         * infinity over infinity is NaN — so the unit vector came out NaN, the
         * eased offset inherited it on the first frame and never recovered, and
         * every transform after that was a string the browser rejected outright.
         * The part sat still and nothing anywhere reported an error.
         */
        const targetX = near > 0 ? (dx / distance) * travel : 0;
        const targetY = near > 0 ? (dy / distance) * travel : 0;

        /*
         * Eased on the wall clock, not per frame.
         *
         * A fixed fraction each frame is a different speed on every display —
         * the same push settles in a third of the time at 120Hz and crawls in a
         * throttled tab. This asks how much of the gap to close in the time
         * that actually passed, which is the same curve at any frame rate.
         */
        const ease = 1 - 2 ** (-dt / 120);
        offset.x += (targetX - offset.x) * ease;
        offset.y += (targetY - offset.y) * ease;

        layer.style.transform = `translate3d(${offset.x.toFixed(2)}px, ${offset.y.toFixed(2)}px, 0)`;
      }

      frame = requestAnimationFrame(draw);
    };

    const onMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
    };

    // The pointer leaving the window is not the same as it being far away: it
    // is nowhere, and everything should settle.
    const onLeave = () => {
      pointerX = Number.NEGATIVE_INFINITY;
      pointerY = Number.NEGATIVE_INFINITY;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry?.isIntersecting ?? false;
        if (visible === running) return;
        running = visible;
        if (visible) {
          last = performance.now();
          frame = requestAnimationFrame(draw);
        } else {
          cancelAnimationFrame(frame);
        }
      },
      { rootMargin: "20%" },
    );
    observer.observe(boxEl);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={box} aria-hidden="true" className="pointer-events-none relative size-full">
      {MARK_CHROME_PARTS.map((part, i) => (
        <div
          key={part.src}
          ref={(node) => {
            layers.current[i] = node;
          }}
          /*
            Every layer is the full box at the full size. They only reassemble
            into the mark because they all letterbox identically — give one of
            them a different size or position and the mark comes apart for good
            rather than for as long as the pointer is near it.
          */
          className="absolute inset-0 bg-contain bg-center bg-no-repeat will-change-transform"
          style={{ backgroundImage: `url(${part.src})` }}
        />
      ))}
    </div>
  );
}
