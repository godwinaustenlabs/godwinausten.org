import { z } from "zod";
import { defineBlock } from "@/modules";

export const servicesRowsSchema = z.object({
  index: z.string().min(1),
  eyebrow: z.string().min(1),
  headline: z.string().min(1),
  rows: z
    .array(
      z.object({
        index: z.string().min(1),
        title: z.string().min(1),
        detail: z.string().min(1),
        /**
         * The offering stated as a claim, in display type, above the detail.
         *
         * `title` names the category — "Workflow Mapping" — which is accurate
         * and indistinguishable from any other agency's service list. This is
         * the position you could disagree with: what it does for the reader,
         * short enough to set large.
         *
         * Optional, because the cell has to survive without one: on a sub-route
         * the same block carries a plain list where a claim per row would be
         * three assertions about nothing.
         */
        claim: z.string().optional(),
        /**
         * Schematic of this offering, drawn in the slack above the claim.
         *
         * Optional and independent of `claim` — see
         * `scripts/generate-diagrams.mjs`.
         */
        figure: z.string().optional(),
      }),
    )
    .min(1),
  /**
   * The hand-off to the next section. Optional: it earns its row on the
   * filmstrip, where the next section is off-screen sideways, and is clutter on
   * a sub-route where the next section is simply the next thing you scroll to.
   */
  next: z.object({ index: z.string(), label: z.string(), href: z.string() }).optional(),
  /**
   * Show the morphing lattice above the headline.
   *
   * Off by default. It is the home page's one piece of ambient motion; on a
   * sub-route, where the same block carries a plain list of channels, it is
   * decoration with nothing to say.
   */
  lattice: z.boolean().default(false),
  /**
   * How the offerings are laid out.
   *
   * `"columns"` is the home page: four cells across a panel the pinned head
   * holds, each one a window on the filmstrip. It is a *summary* — the reader is
   * travelling and the cells are glanced at in sequence.
   *
   * `"sections"` is a page someone came to in order to read. Each offering gets
   * the full width, a heading in display type and its schematic beside it, with
   * a seam between them: four sections rather than four columns of small print.
   * The same four services either way — what changes is how much room they are
   * given to be understood in.
   */
  display: z.enum(["columns", "sections"]).default("columns"),
});

export type ServicesRowsProps = z.infer<typeof servicesRowsSchema>;

export const servicesRows = defineBlock({
  id: "services-rows",
  displayName: "Services — one cell per offering",
  schema: servicesRowsSchema,
  load: () => import("./index"),
  defaults: {
    // `stickyHead` makes the frame publish `--block-lead`, which the head and
    // the ink bar offset themselves by so the cells slide past them.
    layout: { width: "full-bleed", spacing: "none", panel: "content", stickyHead: true },
    motion: { reveal: "rise" },
  },
});
