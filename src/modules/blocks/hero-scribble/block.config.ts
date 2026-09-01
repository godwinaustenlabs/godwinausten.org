import { z } from "zod";
import { defineBlock } from "@/modules";

export const heroScribbleSchema = z.object({
  /** One entry per rendered line — where the headline breaks is a design call. */
  headlineLines: z.array(z.string().min(1)).min(1),
  subhead: z.string().min(1),
  primary: z.object({ label: z.string(), href: z.string() }),
  secondary: z.object({ label: z.string(), href: z.string() }),
  place: z.string().min(1),
  scrollHint: z.string().min(1),
  /** The traced figure. See scripts/trace-figure.mjs. */
  figure: z.string().min(1),
});

export type HeroScribbleProps = z.infer<typeof heroScribbleSchema>;

export const heroScribble = defineBlock({
  id: "hero-scribble",
  displayName: "Hero",
  schema: heroScribbleSchema,
  load: () => import("./index"),
  defaults: {
    layout: { width: "full-bleed", spacing: "none", panel: "viewport" },
    // No reveal: the hero is above the fold, and animating it in costs
    // time-to-first-frame for no gain. `parallax` registers the block with the
    // scroll engine so the figure can drift.
    motion: { parallax: 0.5 },
  },
});
