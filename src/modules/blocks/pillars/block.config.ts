import { z } from "zod";
import { defineBlock } from "@/modules";

export const pillarsSchema = z.object({
  items: z
    .array(
      z.object({
        index: z.string().min(1),
        title: z.string().min(1),
        detail: z.string().min(1),
        /** Backdrop for the tile. Low opacity — texture, not illustration. */
        photo: z.string().optional(),
      }),
    )
    .min(2),
});

export type PillarsProps = z.infer<typeof pillarsSchema>;

export const pillars = defineBlock({
  id: "pillars",
  displayName: "Pillars — three tiles",
  schema: pillarsSchema,
  load: () => import("./index"),
  defaults: {
    layout: { width: "full-bleed", spacing: "none" },
    motion: { reveal: "fade" },
  },
});
