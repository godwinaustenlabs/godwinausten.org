import { z } from "zod";
import { defineBlock } from "@/modules";

export const experienceFeatureSchema = z.object({
  index: z.string().min(1),
  eyebrow: z.string().min(1),
  headline: z.string().min(1),
  lead: z.string().min(1),
  /** The one experience, as a card. Detail lives on /work. */
  card: z.object({
    eyebrow: z.string().min(1),
    client: z.string().min(1),
    name: z.string().min(1),
    body: z.string().min(1),
    notes: z.array(z.object({ label: z.string(), value: z.string() })).min(1),
    videoLabel: z.string().min(1),
    src: z.string().optional(),
    cta: z.object({ label: z.string(), href: z.string() }),
  }),
  /** The hand-off to the next section. */
  next: z.object({ index: z.string(), label: z.string(), href: z.string() }),
});

export type ExperienceFeatureProps = z.infer<typeof experienceFeatureSchema>;

export const experienceFeature = defineBlock({
  id: "experience-feature",
  displayName: "Proof — a claim and one experience card",
  schema: experienceFeatureSchema,
  load: () => import("./index"),
  defaults: {
    layout: { width: "full-bleed", spacing: "none", panel: "content" },
    motion: { reveal: "fade" },
  },
});
