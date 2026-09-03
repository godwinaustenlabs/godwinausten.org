import { z } from "zod";
import { defineBlock } from "@/modules";

export const vslPanelSchema = z.object({
  index: z.string().min(1),
  eyebrow: z.string().min(1),
  headline: z.string().min(1),
  body: z.string().min(1),
  videoLabel: z.string().min(1),
  src: z.string().optional(),
  /** The hand-off to the next section. */
  next: z.object({ index: z.string(), label: z.string(), href: z.string() }),
});

export type VslPanelProps = z.infer<typeof vslPanelSchema>;

export const vslPanel = defineBlock({
  id: "vsl-panel",
  displayName: "VSL — the long version",
  schema: vslPanelSchema,
  load: () => import("./index"),
  defaults: {
    layout: { width: "full-bleed", spacing: "none", panel: "content" },
    // Time-to-first-frame is the metric that matters most here (docs/brief.md);
    // an opacity animation over a video element is the wrong place to spend one.
    motion: { reveal: false },
  },
});
