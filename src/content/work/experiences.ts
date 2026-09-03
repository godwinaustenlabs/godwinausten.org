import { z } from "zod";

/**
 * The experiences — one module's worth of content per build we have shipped.
 *
 * This is the repo's "database" for work (see src/content/README.md). Each entry
 * is both an index row on `/work` and the whole of its own `/work/[slug]` page,
 * so there is one place a fact about a build can live and one place it can go
 * stale.
 *
 * We call these **experiences**, not case studies.
 *
 * No numbers anywhere. Every figure a visitor has read on an agency site was
 * invented, they know it, and one real number we cannot yet publish is worth
 * less than none.
 */

const experienceSchema = z.object({
  slug: z.string().min(1),
  index: z.string().min(1),
  /** What we call it. */
  name: z.string().min(1),
  client: z.string().min(1),
  /** One line for the index row. */
  summary: z.string().min(1),
  /** Disciplines, as tags. */
  services: z.array(z.string().min(1)).min(1),
  status: z.string().min(1),
  /** Placeholder artwork until real footage lands. */
  still: z.string().min(1),
  src: z.string().optional(),
  /**
   * Label for the placeholder reel. Not a duration — there is no film yet, and
   * a timecode would be a number we invented, which this site does not do.
   */
  runtime: z.string().min(1),
  /** The detail page. */
  detail: z.object({
    headline: z.string().min(1),
    lead: z.string().min(1),
    meta: z.array(z.string().min(1)).min(1),
    build: z.object({
      index: z.string().min(1),
      eyebrow: z.string().min(1),
      headline: z.string().min(1),
      sections: z
        .array(
          z.object({
            index: z.string().min(1),
            title: z.string().min(1),
            paragraphs: z.array(z.string().min(1)).min(1),
          }),
        )
        .min(1),
    }),
    closing: z.object({
      index: z.string().min(1),
      eyebrow: z.string().min(1),
      headline: z.string().min(1),
      body: z.string().min(1),
      meta: z.string().min(1),
    }),
  }),
});

export type Experience = z.infer<typeof experienceSchema>;

export const experiences: Experience[] = z.array(experienceSchema).parse([
  {
    slug: "the-picasso-experience",
    index: "01",
    name: "The Picasso Experience",
    client: "faayy.shop",
    summary:
      "A catalogue growing faster than anyone could describe it, and an inbox growing faster than that. Narrow agents that write the listings, answer what the catalogue can answer, and hand the rest to a human with the context attached.",
    services: [
      "Workflow mapping",
      "Catalogue generation",
      "Support automation",
      "Escalation routing",
      "Systems integration",
    ],
    status: "In production",
    still: "/assets/tiles/picasso.svg",
    runtime: "Demo reel",
    detail: {
      headline: "The Picasso Experience.",
      lead: "Faayy had a catalogue growing faster than anyone could describe it and an inbox growing faster than that. This is what we built, how we decided what to build, and what we deliberately left alone.",
      meta: ["faayy.shop", "In production", "Four weeks"],
      build: {
        index: "01",
        eyebrow: "How it was made",
        headline: "Four weeks, in order.",
        sections: [
          {
            index: "01",
            title: "We sat with the work first",
            paragraphs: [
              "Before writing anything we spent a week watching how listings actually got made. The brief said the bottleneck was copywriting. It was not — it was the back-and-forth about which photographs belonged to which variant, which happened over chat and left no trace anywhere a system could read.",
              "That is the usual outcome of the first week, and it is why we do it. Roughly half of what teams ask us to automate turns out not to be the thing costing them.",
            ],
          },
          {
            index: "02",
            title: "Narrow agents, not one big one",
            paragraphs: [
              "One agent that does everything is one agent that fails at everything at once, and is impossible to debug when it does. The Picasso Experience is several: one drafts a listing from photographs and a spec, one answers the questions the catalogue can already answer, and one decides when a human should take over.",
              "Each has a narrow brief and a defined output. When something goes wrong it is obvious which one went wrong, which is the difference between a system a team trusts and one they quietly stop using.",
            ],
          },
          {
            index: "03",
            title: "The handoff is the product",
            paragraphs: [
              "The interesting part of a support agent is not the questions it answers. It is what happens with the ones it should not.",
              "When the escalation agent hands a conversation over, the human gets the order, the history, what was already tried, and why the agent stopped — in the tool they were already working in. No new tab, no context to reconstruct. That was the piece the team noticed.",
            ],
          },
          {
            index: "04",
            title: "What we left alone",
            paragraphs: [
              "Returns and refunds still go to a person, every time. They are low volume, high consequence, and occasionally require judgement about a customer that no playbook contains.",
              "Automating them would have been straightforward and would have been a mistake. Knowing which work to leave is most of the skill.",
            ],
          },
        ],
      },
      closing: {
        index: "02",
        eyebrow: "What happens next",
        headline: "The second one is faster.",
        body: "The mapping week is the same for everyone, but the agent scaffolding, the escalation logic and the integration patterns carry across. If you have a workflow that looks anything like this, most of the answer already exists.",
        meta: "Pakistan — since 2024",
      },
    },
  },
]);

export function experienceBySlug(slug: string): Experience | undefined {
  return experiences.find((experience) => experience.slug === slug);
}
