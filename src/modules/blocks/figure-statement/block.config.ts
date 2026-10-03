import { z } from "zod";
import { defineBlock } from "@/modules";

export const figureStatementSchema = z.object({
  index: z.string().min(1),
  eyebrow: z.string().min(1),
  headline: z.string().min(1),
  body: z.string().min(1),
  /**
   * The drawing, as a URL to an SVG.
   *
   * Painted as a CSS mask, exactly as the hero paints it, so the file is fetched
   * once and cached and the block only ever supplies a colour. A block that
   * inlined 170 KB of path data would put it on the critical path of whatever
   * page placed it.
   */
  figure: z.string().min(1),
  /**
   * The short list beside the paragraph — what the claim means in practice.
   *
   * Mono, numbered, one line each. It is deliberately not prose: a reader
   * deciding whether to apply is scanning, and three lines they can scan beat a
   * fourth paragraph they will not read.
   */
  points: z
    .array(
      z.object({ index: z.string().min(1), title: z.string().min(1), detail: z.string().min(1) }),
    )
    .min(2),
  next: z.object({ index: z.string(), label: z.string(), href: z.string() }).optional(),
});

export type FigureStatementProps = z.infer<typeof figureStatementSchema>;

export const figureStatement = defineBlock({
  id: "figure-statement",
  displayName: "Statement — a claim beside the figure, overprinted",
  schema: figureStatementSchema,
  load: () => import("./index"),
  defaults: {
    layout: { width: "full-bleed", spacing: "none", panel: "content" },
    motion: { reveal: "fade" },
  },
});
