import { z } from "zod";
import { defineBlock } from "@/modules";

export const aboutStatementSchema = z.object({
  index: z.string().min(1),
  eyebrow: z.string().min(1),
  headline: z.string().min(1),
  body: z.string().min(1),
  meta: z.string().min(1),
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
