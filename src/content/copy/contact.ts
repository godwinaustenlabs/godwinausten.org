import { z } from "zod";
import { site } from "@/lib/site";

/**
 * `/contact`.
 *
 * The page exists because "email us" is not an answer to "should I email you?".
 * So it sets expectations instead: what to put in the message, what happens
 * after you send it, and how long it takes. Every one of those removes a reason
 * not to write.
 */

const contactCopySchema = z.object({
  meta: z.object({ title: z.string(), description: z.string() }),
  header: z.object({
    eyebrow: z.string(),
    headline: z.string(),
    lead: z.string(),
    meta: z.array(z.string()),
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
  channels: z.object({
    index: z.string(),
    eyebrow: z.string(),
    headline: z.string(),
    rows: z.array(z.object({ index: z.string(), title: z.string(), detail: z.string() })).min(1),
    next: z.object({ index: z.string(), label: z.string(), href: z.string() }),
  }),
});

export type ContactCopy = z.infer<typeof contactCopySchema>;

export const contactCopy: ContactCopy = contactCopySchema.parse({
  meta: {
    title: "Contact",
    description: "Tell us what you're doing by hand that shouldn't be.",
  },
  header: {
    eyebrow: "Let's talk",
    headline: "Tell us what you're doing by hand.",
    lead: "We'll tell you if an agent can take it — and if it can't, we'll say so. One email is enough to start; there is no form to fill in and nothing to book.",
    meta: ["Lahore, PK", "Replies within two working days"],
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
          "You do not need a brief. Describe one thing your team does by hand every week, roughly how long it takes, and where it currently lives — a tool, a spreadsheet, an inbox.",
          "That is enough for us to tell you whether it is worth automating, and it is a five-minute email rather than a document.",
        ],
      },
      {
        index: "02",
        title: "You get a real answer, not a calendar link",
        paragraphs: [
          "We read it and reply with what we think, including when we think the answer is no. If it looks like something we can build, we'll say what the first month would look like.",
          "If a call would help after that, we'll suggest one. Not before — we have nothing to say on a call that we cannot say in writing first.",
        ],
      },
      {
        index: "03",
        title: "Two working days",
        paragraphs: [
          "We are a small team in Lahore, so allow for the time difference. If it has been longer than that, the message went somewhere it should not have — send it again and say so.",
        ],
      },
    ],
  },
  channels: {
    index: "02",
    eyebrow: "Where to send it",
    headline: "Two addresses.",
    rows: [
      {
        index: "01",
        title: "Work with us",
        detail: `${site.email.work} — a workflow, roughly how long it takes, and where it lives today.`,
      },
      {
        index: "02",
        title: "Careers",
        detail: `${site.email.careers} — we hire rarely and read everything. Send something you built.`,
      },
      {
        index: "03",
        title: "Everything else",
        detail: `${site.email.work} — there is no third address, and nobody screens the first two.`,
      },
    ],
    next: { index: "03", label: "See the work", href: "/work" },
  },
} satisfies ContactCopy);
