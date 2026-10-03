import { z } from "zod";
import { defineBlock } from "@/modules";

export const directLineSchema = z.object({
  index: z.string().min(1),
  eyebrow: z.string().min(1),
  headline: z.string().min(1),
  /**
   * The address, and the whole point of the block.
   *
   * One address, not a list. `/contact` used to run three rows through
   * `services-rows` — work, careers, everything else — which gave the reader a
   * routing decision to make before they could write a sentence, and set the
   * address itself in the same 16px the sentence beside it was in.
   */
  email: z.object({
    address: z.email(),
    /** The mono line under it. What belongs in the message, in a few words. */
    note: z.string().min(1),
  }),
  /**
   * The second way, for people who will not open a mail client.
   *
   * A number and a label rather than a URL: the block builds the link, so the
   * copy module cannot ship one that points somewhere else.
   */
  whatsapp: z.object({
    label: z.string().min(1),
    /** Displayed as written — spacing is a decision, not a format. */
    display: z.string().min(1),
    /** Digits only, country code first, no `+`. What `wa.me` expects. */
    number: z.string().regex(/^\d{7,15}$/, "digits only, country code first"),
    note: z.string().min(1),
  }),
  /**
   * The footnotes: where everything that is *not* work goes.
   *
   * Each is a small cell with an optional way out of it, which is how careers
   * left this page without leaving the site — the row stayed, and it points at
   * `/careers` instead of asking someone to guess an address.
   */
  notes: z
    .array(
      z.object({
        index: z.string().min(1),
        title: z.string().min(1),
        detail: z.string().min(1),
        link: z.object({ label: z.string().min(1), href: z.string().min(1) }).optional(),
      }),
    )
    .min(1),
});

export type DirectLineProps = z.infer<typeof directLineSchema>;

export const directLine = defineBlock({
  id: "direct-line",
  displayName: "Contact — the address, set large, and a second way to reach it",
  schema: directLineSchema,
  load: () => import("./index"),
  defaults: {
    layout: { width: "full-bleed", spacing: "none", panel: "content" },
    motion: { reveal: "fade" },
  },
});
