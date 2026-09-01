import { z } from "zod";
import { defineBlock } from "@/modules";

export const indexListSchema = z.object({
  /** Set with a trailing slash, as in "Selected work /". */
  heading: z.string().min(1),
  entries: z
    .array(
      z.object({
        index: z.string().min(1),
        title: z.string().min(1),
        summary: z.string().min(1),
        client: z.string().min(1),
        /** Disciplines, as tags. */
        services: z.array(z.string().min(1)).min(1),
        href: z.string().min(1),
        /** Runtime label for the row's placeholder reel. */
        runtime: z.string().min(1),
        /** Real footage, when there is any. */
        src: z.string().optional(),
      }),
    )
    .min(1),
});

export type IndexListProps = z.infer<typeof indexListSchema>;

export const indexList = defineBlock({
  id: "index-list",
  displayName: "Index — a list of work",
  schema: indexListSchema,
  load: () => import("./index"),
  defaults: {
    layout: { width: "full-bleed", spacing: "none" },
    motion: { reveal: "fade" },
  },
});
