"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { visibilityClasses } from "./visibility";
import { useScrollStage } from "./ScrollStage";
import type { BlockLayout, BlockMotion, ResponsiveVisibility } from "../types";

const WIDTH: Record<NonNullable<BlockLayout["width"]>, string> = {
  "full-bleed": "w-full",
  container: "mx-auto w-full max-w-screen-xl px-6 md:px-10",
  narrow: "mx-auto w-full max-w-3xl px-6",
};

const SPACING: Record<NonNullable<BlockLayout["spacing"]>, string> = {
  none: "",
  tight: "py-8 md:py-12",
  default: "py-16 md:py-24",
  loose: "py-24 md:py-40",
};

/**
 * How a block sizes itself when the page is running as a horizontal filmstrip.
 *
 * These only ever apply under `strip:`. In flow mode a panel is just a normal
 * full-width section, which is why the same composition renders correctly as a
 * vertical page with no per-block conditionals.
 */
const PANEL: Record<NonNullable<BlockLayout["panel"]>, string> = {
  // Exactly one screen wide — hero, statement, closing panels.
  viewport: "strip:h-full strip:w-screen strip:shrink-0",
  // As wide as its content needs. Grids and row lists that want to run long.
  content: "strip:h-full strip:w-auto strip:shrink-0",
  // Two screens. Used where a section needs room to breathe horizontally.
  wide: "strip:h-full strip:w-[200vw] strip:shrink-0",
};

const REVEAL = {
  fade: { hidden: { opacity: 0 }, shown: { opacity: 1 } },
  rise: { hidden: { opacity: 0, y: 32 }, shown: { opacity: 1, y: 0 } },
  mask: {
    hidden: { opacity: 0, clipPath: "inset(0 0 100% 0)" },
    shown: { opacity: 1, clipPath: "inset(0 0 0% 0)" },
  },
} as const;

export interface BlockFrameProps {
  blockId: string;
  instanceKey: string;
  /** Rendered as the section's `id`, so nav anchors can target it. */
  anchor?: string;
  layout?: BlockLayout;
  motion?: BlockMotion;
  visibility?: ResponsiveVisibility;
  children: ReactNode;
}

/**
 * The one wrapper every block renders inside.
 *
 * Blocks stay dumb: they never set their own page margins, reveal animation,
 * breakpoint visibility, or filmstrip panel width. The frame owns all of it,
 * which is what lets a block be dropped into any page, hidden per-breakpoint, or
 * parallaxed without touching the block's own code.
 *
 * ## Scroll-linked behaviour without a scroll listener in the block
 *
 * The frame registers its section with the stage's scroll engine, which writes
 * two custom properties onto this element every frame:
 *
 * - `--block-progress` — 0→1 as the section crosses the viewport. Parallax
 *   layers read it: `translate3d(calc(var(--block-progress) * -6rem), 0, 0)`.
 * - `--block-lead` — px travelled past the viewport's leading edge, clamped to
 *   the section. Offsetting a child by it pins that child while the rest of the
 *   section moves past (`layout.stickyHead`).
 *
 * Both are measured on whichever axis is live, so the same CSS declaration in a
 * block works whether the page is scrolling down or sideways. `position:
 * sticky` cannot do the second job: inside the filmstrip's transformed track
 * there is no scrollport for it to stick to.
 *
 */
export function BlockFrame({
  blockId,
  instanceKey,
  anchor,
  layout,
  motion: motionHints,
  visibility,
  children,
}: BlockFrameProps) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const stage = useScrollStage();

  const depth = motionHints?.parallax ?? 0;
  const stickyHead = layout?.stickyHead ?? false;

  // Parallax is motion and is dropped under `prefers-reduced-motion`. Pinning is
  // not — it is layout, and removing it would leave a section head scrolling
  // away from rows that were designed against it. So the two have different
  // gates, and a pinned block still joins the loop when a parallaxed one would
  // not.
  const wantsEngine = stickyHead || (depth > 0 && !reduceMotion);

  useEffect(() => {
    const el = ref.current;
    if (!el || !stage || !wantsEngine) return;
    return stage.register(el);
  }, [stage, wantsEngine]);

  const reveal = motionHints?.reveal;
  const variants = reveal ? REVEAL[reveal] : undefined;

  return (
    <motion.section
      ref={ref}
      id={anchor}
      data-block={blockId}
      data-block-key={instanceKey}
      className={cn(
        "relative",
        WIDTH[layout?.width ?? "container"],
        SPACING[layout?.spacing ?? "default"],
        layout?.panel && PANEL[layout.panel],
        layout?.sticky && "sticky top-0",
        visibilityClasses(visibility),
        layout?.className,
      )}
      style={{
        zIndex: layout?.zIndex,
        // Seeded so a block's CSS reads sane values on the very first paint,
        // before the engine has published anything.
        ...(wantsEngine
          ? ({ "--block-progress": 0, "--block-lead": "0px" } as React.CSSProperties)
          : {}),
        // The frame's own parallax depth, for blocks that want to scale their
        // drift off the instance's setting rather than hard-coding a distance.
        ...(depth && !reduceMotion ? ({ "--block-depth": depth } as React.CSSProperties) : {}),
      }}
      {...(variants && !reduceMotion
        ? {
            variants,
            initial: "hidden",
            whileInView: "shown",
            viewport: { once: !motionHints?.repeat, amount: 0.2 },
            transition: { duration: 0.6, delay: motionHints?.delay ?? 0, ease: [0.22, 1, 0.36, 1] },
          }
        : {})}
    >
      {children}
    </motion.section>
  );
}
