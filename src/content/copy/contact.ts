import { z } from "zod";
import { site } from "@/lib/site";

/**
 * `/contact`.
 *
 * The page exists because "email us" is not an answer to "should I email you?".
 * So it sets expectations instead: what to put in the message, what happens
 * after you send it, and how long it takes. Every one of those removes a reason
 * not to write.
 *
 * **Careers is not on this page.** It used to be one of three addresses here,
 * which made the reader route their own message and gave a job application the
 * same weight as a footnote about press enquiries. It is `/careers` now, with
 * `src/content/copy/careers.ts` behind it; what is left here is a single
 * pointer at it.
 */

const contactCopySchema = z.object({
  meta: z.object({ title: z.string(), description: z.string() }),
  header: z.object({
    /*
      Optional, and `/contact` does not set it.

      The bar read "Let's talk" directly above "Tell us what you're doing by
      hand." — the same invitation twice, the second time in 11px mono, on a
      page whose whole subject is already named in the nav beside the wordmark.
      Every other page's header still uses it to say which section you are in;
      this is the one page where that is not news.
    */
    eyebrow: z.string().min(1).optional(),
    headline: z.string(),
    lead: z.string(),
    /*
      Optional, and `/contact` does not set it either.

      The bar carried "Pakistan" and "Replies within two working days" — two
      facts the page then makes again, properly, in the section under it: the
      lead says one email is enough to start, and "Two working days" is its own
      numbered section with a paragraph explaining what to do if it has been
      longer. Set twice, the 11px mono version is not a summary, it is the page
      answering a question it is about to answer.
    */
    meta: z.array(z.string()).optional(),
    photo: z.object({ src: z.string(), alt: z.string() }).optional(),
  }),
  expectations: z.object({
    index: z.string(),
    eyebrow: z.string(),
    headline: z.string(),
    sections: z
      .array(
        z.object({
          index: z.string(),
          title: z.string(),
          paragraphs: z.array(z.string()).min(1),
        }),
      )
      .min(1),
  }),
  /**
   * Where to send it.
   *
   * One address, a WhatsApp number, and a short row of footnotes — not the
   * three-row list this used to be. Careers left the page entirely: it has its
   * own route now, and a footnote points at it rather than offering a second
   * address for the reader to choose between. See `src/content/copy/careers.ts`.
   */
  channels: z.object({
    index: z.string(),
    eyebrow: z.string(),
    headline: z.string(),
    email: z.object({ address: z.email(), note: z.string() }),
    whatsapp: z.object({
      label: z.string(),
      display: z.string(),
      number: z.string(),
      note: z.string(),
    }),
    notes: z
      .array(
        z.object({
          index: z.string(),
          title: z.string(),
          detail: z.string(),
          link: z.object({ label: z.string(), href: z.string() }).optional(),
        }),
      )
      .min(1),
  }),
});

export type ContactCopy = z.infer<typeof contactCopySchema>;

export const contactCopy: ContactCopy = contactCopySchema.parse({
  meta: {
    title: "Contact",
    description: "Tell us what you're doing by hand that shouldn't be.",
  },
  header: {
    headline: "Tell us what you're doing by hand.",
    lead: "We'll tell you if an agent can take it, and if it can't, we'll say so. One email is enough to start; there is no form to fill in and nothing to book.",
    photo: { src: "/assets/photo/fibre.jpg", alt: "Blue fibre-optic strands radiating outward" },
  },
  expectations: {
    index: "01",
    eyebrow: "Before you write",
    headline: "What to send, and what happens next.",
    sections: [
      {
        index: "01",
        title: "One workflow is enough",
        paragraphs: [
          "You do not need a brief. Describe one thing your team does by hand every week, roughly how long it takes, and where it currently lives: a tool, a spreadsheet, an inbox.",
          "That is enough for us to tell you whether it is worth automating, and it is a five-minute email rather than a document.",
        ],
      },
      {
        index: "02",
        title: "You get a real answer, not a calendar link",
        paragraphs: [
          "We read it and reply with what we think, including when we think the answer is no. If it looks like something we can build, we'll say what the first month would look like.",
          "If a call would help after that, we'll suggest one. Not before. We have nothing to say on a call that we cannot say in writing first.",
        ],
      },
      {
        index: "03",
        title: "Two working days",
        paragraphs: [
          "We are a small team in Pakistan, so allow for the time difference. If it has been longer than that, the message went somewhere it should not have. Send it again and say so.",
        ],
      },
    ],
  },
  channels: {
    index: "02",
    eyebrow: "Where to send it",
    headline: "One address.",
    email: {
      address: site.email.work,
      note: "A workflow, roughly how long it takes, and where it lives today",
    },
    whatsapp: {
      label: "WhatsApp",
      display: "+92 339 6146241",
      number: "923396146241",
      note: "If a thread is easier than an email. Same people, same day",
    },
    notes: [
      {
        index: "01",
        title: "Nobody screens it",
        detail:
          "There is no assistant, no form and no routing. The address above reaches the people who would do the work.",
      },
      {
        index: "02",
        title: "Looking for a job",
        detail:
          "That is a different page and a different address. We hire rarely, and when we do it goes up there.",
        link: { label: "See open roles", href: "/careers" },
      },
      {
        index: "03",
        title: "Everything else",
        detail:
          "Press, suppliers, someone who read something we wrote — same address. There is no second one.",
      },
    ],
  },
} satisfies ContactCopy);
