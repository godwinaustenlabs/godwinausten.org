import { z } from "zod";
import { defineBlock } from "@/modules";

export const charterSchema = z.object({
  index: z.string().min(1),
  eyebrow: z.string().min(1),
  headline: z.string().min(1),
  /**
   * The opening, beside the figure. Paragraphs, because this one is allowed to
   * be long — it is the only section on the site that states an ambition, and an
   * ambition stated in one line is a slogan.
   */
  lead: z.array(z.string().min(1)).min(1),
  /**
   * The picture beside the statement.
   *
   * A full-bleed media cell, not a contained drawing: it runs the height of the
   * panel and butts the type on the grid's one-pixel seam, which is how every
   * other picture on this site is placed.
   *
   * It replaced a generated wire figure (`npm run gen:ascent`, still in
   * `scripts/`). The drawing was original to the repo, which was its one real
   * advantage; a photograph that says the same thing in one frame beats a
   * procedural figure that has to be defended.
   *
   * Optional. Without one the statement takes the full width.
   */
  figure: z.string().min(1).optional(),
  /**
   * A picture laid *under* the first spotlight section.
   *
   * The spotlights are the page's one run of ink and they used to arrive with no
   * warning — a paper section ends and three dark ones begin. This was a band of
   * picture in between, which worked but put the image and the words it belongs
   * to in two different places.
   *
   * It is a backdrop now: the photograph fills the first lit section and the
   * 100-year plan is set over it. Same black, so there is no seam between
   * the picture and the two lit sections after it — the page simply goes dark,
   * and the first thing in the dark has something behind it.
   *
   * Optional, and it renders nothing if no section is a spotlight.
   */
  backdrop: z.string().min(1).optional(),
  /**
   * The rest of it, as headed sections rather than one wall of prose.
   *
   * This started as three paragraphs under the headline with a row of three
   * cards beneath them, and both halves were wrong in the same way: the prose
   * was too long to be scanned and the cards were too short to say anything, so
   * the section said everything twice at two lengths. Headings are what let a
   * reader take the argument at their own resolution.
   */
  sections: z
    .array(
      z.object({
        index: z.string().min(1),
        title: z.string().min(1),
        paragraphs: z.array(z.string().min(1)).min(1),
        /**
         * One line, set large under the heading — the section's thesis.
         *
         * **Not a pull quote.** A lifted sentence is the usual way to fill the
         * column beside a paragraph, and it means the reader meets the same
         * words twice at two sizes; the row of cards this section replaced
         * failed in exactly that way. This is a different sentence saying the
         * thing the paragraphs take two hundred words to earn, so a reader who
         * only scans the left column still leaves with the argument.
         */
        pull: z.string().min(1).optional(),
        /**
         * Give this section the spotlight treatment: ink ground, the accent rule,
         * and display type a size up.
         *
         * For the three that are the company's actual commitments — the horizon,
         * the vision, the mission. They were cards, and a card is the one pattern
         * this site does not have (`docs/brief.md`, the card test). As spotlights
         * they are the same three claims given more room rather than less, and
         * they punctuate the prose instead of sitting in a row underneath it.
         *
         * Use it sparingly. Three lit sections in a row is a lit section, and
         * nothing is emphasised.
         */
        spotlight: z.boolean().default(false),
      }),
    )
    .min(1),
});

export type CharterProps = z.infer<typeof charterSchema>;

export const charter = defineBlock({
  id: "charter",
  displayName: "Who we are — the statement, and what it commits us to",
  schema: charterSchema,
  load: () => import("./index"),
  defaults: {
    // Taller than the band, like `prose-sections`: this is read, not glanced at,
    // and it only ever appears on a vertical route.
    layout: { width: "full-bleed", spacing: "none" },
    motion: { reveal: "fade" },
  },
});
