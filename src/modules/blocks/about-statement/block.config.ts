import { z } from "zod";
import { defineBlock } from "@/modules";

export const aboutStatementSchema = z.object({
  index: z.string().min(1),
  eyebrow: z.string().min(1),
  headline: z.string().min(1),
  body: z.string().min(1),
  /**
   * A plain closing line along the foot. Optional — the bar is a whole row of
   * the panel, so an empty one is a strip of ink with a dot in it.
   */
  meta: z.string().min(1).optional(),
});

export type AboutStatementProps = z.infer<typeof aboutStatementSchema>;

export const aboutStatement = defineBlock({
  id: "about-statement",
  displayName: "About — statement panel",
  schema: aboutStatementSchema,
  load: () => import("./index"),
  defaults: {
    layout: { width: "full-bleed", spacing: "none", panel: "viewport" },
    motion: { reveal: "rise", parallax: 0.3 },
  },
});
