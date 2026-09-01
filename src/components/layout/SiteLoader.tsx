"use client";

import { LOADER_SHAPES, LOADER_VIEWBOX } from "./loader-mark";
import { cn } from "@/lib/utils";

/**
 * The loader curtain — the mark from the live godwinausten.org.
 *
 * ## What it does
 *
 * A full-viewport panel carrying the logomark. On first load it is already
 * covering, the mark writes itself on, and the curtain **drops up** out of the
 * frame to reveal the page. On a route change it **drops down** to cover, the
 * route swaps behind it, then it drops up again.
 *
 * Down to cover, up to reveal — the same gesture in both directions, which is
 * what makes navigation feel like one continuous surface rather than a cut.
 *
 * ## Why the mark is inlined
 *
 * The stroke writes itself on with `stroke-dasharray` / `stroke-dashoffset`,
 * and those only animate on paths that are in the document. Referencing the
 * SVG as an `<img>` would give a static logo.
 *
 * Each shape is drawn twice: a stroke that draws, and a fill that fades in
 * behind it once the outline is closed. That is how the original works.
 *
 * ## Accessibility
 *
 * `aria-hidden` and `pointer-events-none`: it is a visual cover, and a screen
 * reader should hear the page, not a decorative mark. Under
 * `prefers-reduced-motion` the curtain is hidden outright, in CSS — see
 * `globals.css`.
 *
 * ## No state
 *
 * The drawing is a CSS animation, and the mark is keyed on `phase` so it
 * replays on every navigation. A transition would need a state change one frame
 * after mount to interpolate from, which is a `setState` inside an effect and a
 * cascading render for something CSS does on its own.
 */

/** How long the mark takes to draw, and how long the curtain takes to move. */
const DRAW_MS = 900;
const SLIDE_MS = 620;

export type LoaderPhase = "hidden" | "covering" | "revealing";

export function SiteLoader({ phase }: { phase: LoaderPhase }) {
  return (
    <div
      aria-hidden="true"
      data-loader={phase}
      className={cn(
        "pointer-events-none fixed inset-0 z-[80] flex items-center justify-center bg-paper",
        "transition-transform ease-[cubic-bezier(0.76,0,0.24,1)]",
        // Off the top when idle; over the page while covering; back off the top
        // to reveal. One axis, one gesture, both directions.
        phase === "covering" ? "translate-y-0" : "-translate-y-full",
      )}
      style={{ transitionDuration: `${SLIDE_MS}ms` }}
    >
      {/* Keyed on the phase so the mark redraws every time the curtain drops. */}
      <svg
        key={phase}
        viewBox={LOADER_VIEWBOX}
        className="w-[46vmin] max-w-[420px] text-ink"
        fill="none"
        role="presentation"
      >
        {LOADER_SHAPES.map((shape, i) => (
          <g key={i} transform={`translate(${shape.x},${shape.y})`}>
            {/* The outline writes itself on… */}
            <path
              d={shape.d}
              fill="none"
              stroke="currentColor"
              // 10 in a 2000-unit viewBox — the width the original uses. It was
              // raised to 20 to make the outline read at small sizes and that
              // was the wrong trade: the mark's character is a thin, delicate
              // line, and a heavy one turns it into a sticker.
              strokeWidth={10}
              strokeLinecap="round"
              pathLength={1}
              style={{
                strokeDasharray: 1,
                animation: `loader-draw ${DRAW_MS}ms cubic-bezier(0.65,0,0.35,1) ${i * 90}ms both`,
              }}
            />
            {/* …and the fill arrives behind it once the shape is closed. */}
            <path
              d={shape.d}
              fill="currentColor"
              style={{
                animation: `loader-fill ${DRAW_MS * 0.5}ms linear ${DRAW_MS * 0.6 + i * 90}ms both`,
              }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

/** Total time the curtain needs to cover and finish drawing. */
export const LOADER_COVER_MS = SLIDE_MS + DRAW_MS;
/** Time the curtain needs to clear the frame. */
export const LOADER_REVEAL_MS = SLIDE_MS;
