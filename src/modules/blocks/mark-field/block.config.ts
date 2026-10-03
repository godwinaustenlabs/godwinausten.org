import { z } from "zod";
import { defineBlock } from "@/modules";

export const markFieldSchema = z.object({
  index: z.string().min(1),
  eyebrow: z.string().min(1),
  headline: z.string().min(1),
  body: z.string().min(1),
  /**
   * The invitation, set above the way in.
   *
   * Separate from `body` because it is doing a different job: the body says
   * what Labs is, and this asks for something. Someone skimming should be able
   * to read the second without the first.
   */
  note: z.string().min(1),
  /** Where an application goes. An address, not a form — there is no form. */
  apply: z.object({ label: z.string().min(1), email: z.string().min(1) }),
  /**
   * The words in the overprint, one per line.
   *
   * The motto was hard-coded here for as long as this block appeared on exactly
   * one page. `/careers` places it too, and the same four words on both would
   * make the second one read as a copy of the first rather than as the same
   * press run twice — so the panel keeps its print and the page chooses what is
   * printed on it.
   *
   * Set them short. The type is 132 units in a 1160-unit box, so anything past
   * about ten characters runs out of the plate, and four or five lines is what
   * the box was drawn for.
   */
  print: z.array(z.string().min(1)).min(1).default(["MAKE", "SOMETHING", "CRAZY", "WITH US"]),
  next: z.object({ index: z.string(), label: z.string(), href: z.string() }),
});

export type MarkFieldProps = z.infer<typeof markFieldSchema>;

export const markField = defineBlock({
  id: "mark-field",
  displayName: "Labs — the motto, and a way in",
  schema: markFieldSchema,
  load: () => import("./index"),
  defaults: {
    /*
     * No longer `stripOnly`.
     *
     * That existed for a pointer-driven ornament: a cursor-lit surface with no
     * cursor to light it is dead weight on a phone. The panel carries a
     * watermark and an address now, both of which read the same everywhere, and
     * hiding the company's other half from every phone visitor was never the
     * intent — it was a consequence of what used to be drawn here.
     */
    layout: { width: "full-bleed", spacing: "none", panel: "content" },
    motion: { reveal: "fade" },
  },
});
