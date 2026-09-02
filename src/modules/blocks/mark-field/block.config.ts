import { z } from "zod";
import { defineBlock } from "@/modules";

export const markFieldSchema = z.object({
  index: z.string().min(1),
  eyebrow: z.string().min(1),
  headline: z.string().min(1),
  body: z.string().min(1),
  /** The nudge that tells someone the surface does anything at all. */
  hint: z.string().min(1),
  next: z.object({ index: z.string(), label: z.string(), href: z.string() }),
});

export type MarkFieldProps = z.infer<typeof markFieldSchema>;

export const markField = defineBlock({
  id: "mark-field",
  displayName: "Mark field — lit cloth, mark pressed into it",
  schema: markFieldSchema,
  load: () => import("./index"),
  defaults: {
    // `stripOnly`: a pointer-driven ornament with no cursor to drive it on a
    // phone, and nothing the funnel depends on. See BlockLayout in types.ts.
    layout: { width: "full-bleed", spacing: "none", panel: "content", stripOnly: true },
    // No reveal. The block's whole content is a surface that responds to the
    // pointer; fading it in on entry animates the thing that is already the
    // animation.
    motion: { reveal: false },
  },
});
