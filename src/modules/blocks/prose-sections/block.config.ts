import { z } from "zod";
import { defineBlock } from "@/modules";

export const proseSectionsSchema = z.object({
  index: z.string().min(1),
  eyebrow: z.string().min(1),
  headline: z.string().optional(),
  /**
   * Numbered sections, each a heading and a few paragraphs. The workhorse of
   * the vertical sub-routes — where the home page argues, these explain.
   */
  sections: z
    .array(
      z.object({
        index: z.string().min(1),
        title: z.string().min(1),
        paragraphs: z.array(z.string().min(1)).min(1),
      }),
    )
    .min(1),
});

export type ProseSectionsProps = z.infer<typeof proseSectionsSchema>;

export const proseSections = defineBlock({
  id: "prose-sections",
  displayName: "Prose — numbered sections",
  schema: proseSectionsSchema,
  load: () => import("./index"),
  defaults: {
    layout: { width: "full-bleed", spacing: "none" },
    // `fade`, not `rise`: this block runs taller than the viewport on the
    // sub-routes, and translating a section that size is a large composited
    // layer moving under the reader while they scroll.
    motion: { reveal: "fade" },
  },
});
