import { z } from "zod";
import { defineBlock } from "@/modules";

export const contactFooterSchema = z.object({
  index: z.string().min(1),
  eyebrow: z.string().min(1),
  headline: z.string().min(1),
  body: z.string().min(1),
  channels: z.array(z.object({ label: z.string(), email: z.email() })).min(1),
  /** Wordmark, set huge and cropped by the panel edge. */
  wordmark: z.string().min(1),
  /** Backdrop behind the cropped wordmark. */
});

export type ContactFooterProps = z.infer<typeof contactFooterSchema>;

export const contactFooter = defineBlock({
  id: "contact-footer",
  displayName: "Contact + footer",
  schema: contactFooterSchema,
  load: () => import("./index"),
  defaults: {
    layout: { width: "full-bleed", spacing: "none", panel: "viewport" },
    motion: { reveal: "fade" },
  },
});
