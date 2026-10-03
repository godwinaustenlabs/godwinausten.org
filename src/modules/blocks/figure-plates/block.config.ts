import { z } from "zod";
import { defineBlock } from "@/modules";

export const figurePlatesSchema = z.object({
  /**
   * The plates, left to right, each filling the full height of the band.
   *
   * Two or three. One is a picture rather than a band; four at panel width gives
   * each of them a column too narrow for a figure to be read in.
   */
  plates: z
    .array(z.object({ src: z.string().min(1) }))
    .min(2)
    .max(3),
  headline: z.string().min(1),
  body: z.string().min(1),
});

export type FigurePlatesProps = z.infer<typeof figurePlatesSchema>;

export const figurePlates = defineBlock({
  id: "figure-plates",
  displayName: "Plates — a band of figures, and one line",
  schema: figurePlatesSchema,
  load: () => import("./index"),
  defaults: {
    layout: { width: "full-bleed", spacing: "none", panel: "viewport" },
    // `fade`, not `rise`. This is a full panel of photograph and the one thing it
    // must not do is arrive with a jolt — it is the page taking a breath.
    motion: { reveal: "fade" },
  },
});
