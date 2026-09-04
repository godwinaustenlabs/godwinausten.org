"use client";

import { useEffect, useRef } from "react";

/**
 * The pointer.
 *
 * A filled dot on the pointer itself and a ring that runs to catch up with it.
 * The ring is the whole point: a dot that simply replaces the arrow is a
 * novelty, but a dot with something chasing it turns every movement on the page
 * into a small piece of motion, and this is a site whose panels already slide.
 *
 * ## Visible on paper and on ink, without knowing which it is on
 *
 * Both parts are painted white through `mix-blend-mode: difference`, so what
 * lands on screen is the inverse of whatever is behind them: near-black on the
 * paper, near-white on an ink cell, and legible over the film and the photos in
 * between. Nothing has to be told what it is over — no sampling, no reading the
 * background, no class on the sections. It cannot be wrong.
 *
 * ## Never the only pointer
 *
 * The native cursor is hidden by a `data-cursor` attribute that *this component*
 * sets, and only after it has confirmed a fine pointer. A visitor with no
 * JavaScript, or on a touch screen, or on a trackpad-less device, is never left
 * with `cursor: none` and nothing drawn in its place — the attribute is simply
 * never set, and the stylesheet does nothing.
 *
 * Text fields keep their own I-beam (see `globals.css`) and the layer hides over
 * them. A caret is not decoration: it says where the next character goes, and a
 * dot floating near a field does not.
 */
export function Cursor() {
  const layer = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const layerEl = layer.current;
    const dotEl = dot.current;
    const ringEl = ring.current;
    if (!layerEl || !dotEl || !ringEl) return;

    // A coarse pointer has no cursor to replace, and a finger is already the
    // dot. Checked once on mount rather than watched: a device does not grow a
    // mouse mid-visit often enough to be worth a listener.
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    root.dataset.cursor = "custom";

    /*
     * Where the pointer is, and where the ring has got to.
     *
     * They start together and off screen, so the first frame after the pointer
     * appears does not draw a ring streaking in from the corner.
     */
    let x = -100;
    let y = -100;
    let ringX = x;
    let ringY = y;
    let scale = 1;
    let target = 1;
    let last = performance.now();
    let frame = 0;

    const draw = (now: number) => {
      /*
       * Eased on the wall clock, not per frame.
       *
       * A fixed fraction each frame is a different speed on every display: the
       * same ring settles in a third of the time on a 120Hz screen and crawls
       * on a throttled tab. `1 - 2 ** (-dt / halfLife)` is the same curve at
       * any frame rate, because it asks how much of the gap should be closed in
       * the time that actually passed.
       */
      const dt = Math.min(now - last, 64);
      last = now;

      const ease = (halfLife: number) => 1 - 2 ** (-dt / halfLife);
      const chase = motion.matches ? 1 : ease(70);
      ringX += (x - ringX) * chase;
      ringY += (y - ringY) * chase;
      scale += (target - scale) * (motion.matches ? 1 : ease(90));

      dotEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      ringEl.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) scale(${scale.toFixed(3)})`;

      frame = requestAnimationFrame(draw);
    };

    // What the pointer is over decides the shape: the ring opens up and the dot
    // gets out of the way over anything that can be pressed, so the thing being
    // pointed at is inside the ring rather than under a blob.
    const INTERACTIVE =
      'a,button,summary,label,[role="button"],[role="link"],[tabindex]:not([tabindex="-1"])';
    const TEXT = "input,textarea,select,[contenteditable]";

    const onMove = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      layerEl.dataset.visible = "true";

      const el = event.target instanceof Element ? event.target : null;
      const overText = Boolean(el?.closest(TEXT));
      layerEl.dataset.state = overText ? "text" : "";
      target = !overText && el?.closest(INTERACTIVE) ? 1.85 : 1;

      if (!motion.matches) return;
      // With motion reduced the ring does not chase, so it has to be told where
      // the pointer went the moment it moves rather than easing there.
      ringX = x;
      ringY = y;
    };

    // Leaving the window is the one case where the ring should not catch up: it
    // would coast to the edge after the pointer has already gone.
    const onLeave = () => {
      layerEl.dataset.visible = "false";
    };
    const onEnter = () => {
      layerEl.dataset.visible = "true";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      delete root.dataset.cursor;
    };
  }, []);

  return (
    <div ref={layer} aria-hidden="true" className="cursor-layer" data-visible="false">
      <div ref={ring} className="cursor-ring" />
      <div ref={dot} className="cursor-dot" />
    </div>
  );
}
