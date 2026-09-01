/**
 * The lego-block contract.
 *
 * A *block* is a self-contained, independently renderable slice of UI.
 * A *page* is an ordered list of block *instances* (a `PageComposition`).
 * Nothing in this file knows about any specific block — the registry does.
 *
 * See docs/modules.md for the authoring guide.
 */

import type { ComponentType } from "react";
import type { z } from "zod";

/** Tailwind's breakpoint ladder. `base` = mobile-first default. */
export const BREAKPOINTS = ["base", "sm", "md", "lg", "xl", "2xl"] as const;
export type Breakpoint = (typeof BREAKPOINTS)[number];

/**
 * Per-breakpoint visibility. Omitted breakpoints inherit the next smallest.
 * `{ base: false, md: true }` => hidden on phones, visible from `md` up.
 */
export type ResponsiveVisibility = Partial<Record<Breakpoint, boolean>>;

/** How a block claims horizontal space in the page grid. */
export type BlockWidth = "full-bleed" | "container" | "narrow";

/** Vertical rhythm applied by the frame, not by the block itself. */
export type BlockSpacing = "none" | "tight" | "default" | "loose";

/**
 * How a block sizes itself when the page runs as a horizontal filmstrip
 * (`ScrollStage`, wide desktop only). Ignored in normal vertical flow, which is
 * why a composition needs no per-breakpoint forks.
 */
export type BlockPanel = "viewport" | "content" | "wide";

export interface BlockLayout {
  width?: BlockWidth;
  spacing?: BlockSpacing;
  /** Filmstrip panel sizing. Only has an effect inside a `ScrollStage`. */
  panel?: BlockPanel;
  /** Stick to the viewport while the next blocks scroll past it. */
  sticky?: boolean;
  /**
   * Publish `--block-lead` so the block can pin part of itself while the rest
   * travels past.
   *
   * The block does not implement pinning — `position: sticky` is inert inside
   * the filmstrip's transformed track, so there is no CSS-only answer that
   * works on both axes. The frame measures; the block applies the offset with
   * one transform. See docs/modules.md.
   */
  stickyHead?: boolean;
  /** Explicit stacking context; used when blocks overlap during transitions. */
  zIndex?: number;
  /** Extra classes merged onto the frame. Escape hatch — prefer the fields above. */
  className?: string;
}

/** Scroll-linked and enter/exit behaviour, applied by the frame. */
export interface BlockMotion {
  /** Fade/slide in when the block enters the viewport. */
  reveal?: false | "fade" | "rise" | "mask";
  /** Parallax depth. 0 = locked to scroll, 1 = strong drift. */
  parallax?: number;
  /** Seconds of delay before `reveal` runs. */
  delay?: number;
  /** Re-run `reveal` every time the block re-enters, not just the first time. */
  repeat?: boolean;
}

/**
 * A block's runtime lifecycle. Blocks are mounted/unmounted by the renderer so
 * page-to-page transitions can cross-fade compositions without a route change.
 */
export type BlockPresence = "always" | "on-view" | "deferred";

/** One placed block on a page. `key` must be stable — it drives React identity. */
export interface BlockInstance<Id extends string = string, P = unknown> {
  key: string;
  block: Id;
  props: P;
  /**
   * DOM id for the section, so nav anchors can target it. Set by the
   * composition rather than the block, because only the page knows which of its
   * sections deserve a permalink.
   */
  anchor?: string;
  layout?: BlockLayout;
  motion?: BlockMotion;
  visibility?: ResponsiveVisibility;
  presence?: BlockPresence;
}

/** What a block declares about itself at author time. */
export interface BlockDefinition<Id extends string = string, S extends z.ZodType = z.ZodType> {
  id: Id;
  /** Human label for docs and any future visual composer. */
  displayName: string;
  /** Runtime-validated prop contract. Invalid props fail loudly in dev. */
  schema: S;
  /** Lazily loaded so an unused block costs nothing in the bundle. */
  load: () => Promise<{ default: ComponentType<z.infer<S>> }>;
  /** Defaults the frame applies unless the instance overrides them. */
  defaults?: {
    layout?: BlockLayout;
    motion?: BlockMotion;
    presence?: BlockPresence;
  };
  /**
   * `true` when the block reads request-time data or Cloudflare bindings.
   * Server-only blocks can never be placed inside a client-composed section.
   */
  serverOnly?: boolean;
}

/** An ordered set of block instances that makes up one renderable surface. */
export interface PageComposition {
  /** Route-ish identifier, used for analytics and transition matching. */
  id: string;
  blocks: BlockInstance[];
}
