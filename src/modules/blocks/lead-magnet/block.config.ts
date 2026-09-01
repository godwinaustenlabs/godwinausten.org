import { z } from "zod";
import { defineBlock } from "@/modules";

export const leadMagnetSchema = z.object({
  index: z.string().min(1),
  eyebrow: z.string().min(1),
  kicker: z.string().min(1),
  headline: z.string().min(1),
  body: z.string().min(1),
  contents: z.array(z.string().min(1)).min(1),
  cover: z.object({ title: z.string().min(1), format: z.string().min(1) }),
  placeholder: z.string().min(1),
  submit: z.string().min(1),
  micro: z.string().min(1),
  success: z.string().min(1),
  successBody: z.string().min(1),
  /** The hand-off to the next section. */
  next: z.object({ index: z.string(), label: z.string(), href: z.string() }),
  /** DOM id the hero's "Get the playbook" link targets. */
  anchor: z.string().min(1),
});

export type LeadMagnetProps = z.infer<typeof leadMagnetSchema>;

export const leadMagnet = defineBlock({
  id: "lead-magnet",
  displayName: "Lead magnet — the playbook opt-in",
  schema: leadMagnetSchema,
  load: () => import("./index"),
  defaults: {
    layout: { width: "full-bleed", spacing: "none", panel: "viewport" },
    // No reveal. This is the page's one conversion; an opacity animation
    // between the reader deciding and the field being usable is a cost with no
    // return.
    motion: { reveal: false },
  },
});
