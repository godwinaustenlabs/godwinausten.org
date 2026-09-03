import { z } from "zod";
import { defineBlock } from "@/modules";

export const pageHeaderSchema = z.object({
  /**
   * Mono label in the masthead's top bar. Optional: a page whose headline
   * already says what the page is does not need a second, quieter label saying
   * it again, and the bar is a visible band rather than a free annotation.
   */
  eyebrow: z.string().min(1).optional(),
  headline: z.string().min(1),
  lead: z.string().optional(),
  /** Small mono facts set along the bottom rule. Plain text, never metrics. */
  meta: z.array(z.string()).default([]),
  /**
   * A reel under the masthead, full width. Only the experience pages use it —
   * a page about one build should show the build.
   */
  reel: z.object({ runtime: z.string(), src: z.string().optional() }).optional(),
  /**
   * A photograph behind the masthead. Kept low-contrast: it is here to give the
   * page a temperature, not to be looked at.
   */
  photo: z.object({ src: z.string(), alt: z.string() }).optional(),
});

export type PageHeaderProps = z.infer<typeof pageHeaderSchema>;

export const pageHeader = defineBlock({
  id: "page-header",
  displayName: "Page header — masthead for a sub-route",
  schema: pageHeaderSchema,
  load: () => import("./index"),
  defaults: {
    layout: { width: "full-bleed", spacing: "none", panel: "viewport" },
    motion: { reveal: "fade" },
  },
});
