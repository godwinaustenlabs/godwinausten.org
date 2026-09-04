import { z } from "zod";

/**
 * `/about`.
 *
 * The page someone opens when they are deciding whether we are real. So it
 * answers that: who we are, how we work, what we refuse, and what it is like to
 * hire us. Prose rather than a manifesto — a page of adjectives about
 * ourselves would prove the opposite of what it claims.
 */

const aboutCopySchema = z.object({
  meta: z.object({ title: z.string(), description: z.string() }),
  header: z.object({
    headline: z.string(),
    lead: z.string(),
    photo: z.object({ src: z.string(), alt: z.string() }).optional(),
  }),
  /** Three tiles, before a word of prose. Read from oddcommon's /expertise. */
  pillars: z.object({
    items: z
      .array(
        z.object({
          index: z.string(),
          title: z.string(),
          detail: z.string(),
          photo: z.string().optional(),
        }),
      )
      .min(2),
  }),
  services: z.object({
    index: z.string(),
    eyebrow: z.string(),
    headline: z.string(),
    rows: z
      .array(
        z.object({
          index: z.string(),
          title: z.string(),
          detail: z.string(),
          /** Schematic of this offering. See scripts/generate-diagrams.mjs. */
          figure: z.string(),
        }),
      )
      .min(1),
  }),
  method: z.object({
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
  statement: z.object({
    index: z.string(),
    eyebrow: z.string(),
    headline: z.string(),
    body: z.string(),
  }),
});

export type AboutCopy = z.infer<typeof aboutCopySchema>;

export const aboutCopy: AboutCopy = aboutCopySchema.parse({
  meta: {
    title: "About",
    description: "A small engineering team in Pakistan building AI systems that ship.",
  },
  header: {
    headline: "Small team. Big appetite for automation.",
    lead: "We're a handful of engineers who got tired of watching good people do repetitive work. So we build the software that does it instead. No decks, no six-month roadmaps — just systems that ship.",
    photo: {
      src: "/assets/photo/wire-dark.jpg",
      alt: "A pile of black wires resting on each other",
    },
  },
  pillars: {
    items: [
      {
        index: "01",
        title: "Map",
        detail: "A week watching the actual work, before a line is written.",
        photo: "/assets/photo/wire-tangle.jpg",
      },
      {
        index: "02",
        title: "Build",
        detail: "Narrow agents with defined outputs, inside the stack you already run.",
        photo: "/assets/diagrams/build.svg",
      },
      {
        index: "03",
        title: "Tune",
        detail: "The month after launch, when the real world finds what we missed.",
        photo: "/assets/diagrams/tune.svg",
      },
    ],
  },
  services: {
    index: "01",
    eyebrow: "What we do",
    headline: "What we offer.",
    rows: [
      {
        index: "01",
        title: "Full Agentic AI Systems",
        figure: "/assets/diagrams/swarm.svg",
        detail:
          "The whole operation, not a chatbot on top of it. Agents that hold context, take decisions inside your rules, and hand off to each other and to a person when the call is not theirs to make.",
      },
      {
        index: "02",
        title: "Micro Agents & Bots for Task Automation",
        figure: "/assets/diagrams/micro.svg",
        detail:
          "One task, done properly, live in a week. The cheapest thing we build and usually the first — small enough to add without a project and to remove without one.",
      },
      {
        index: "03",
        title: "AI Powered Pipelines",
        figure: "/assets/diagrams/pipeline.svg",
        detail:
          "Work that arrives in a queue and leaves finished: enrich, classify, draft, route. The volume nobody wants to look at, handled before anyone has to.",
      },
      {
        index: "04",
        title: "Custom Solutions for SaaS and Enterprises",
        figure: "/assets/diagrams/integration.svg",
        detail:
          "Inside your product or inside your stack. AI features your customers use, or systems wired through the CRM, the helpdesk and the compliance path you already run.",
      },
    ],
  },
  method: {
    index: "02",
    eyebrow: "How we work",
    headline: "We ship, then we tune.",
    sections: [
      {
        index: "01",
        title: "Week one is watching, not building",
        paragraphs: [
          "Every engagement starts with us sitting with the work. Not a workshop — the actual work, as it happens, with the people who do it.",
          "It is the least glamorous week and the one that decides whether the rest is worth anything. The thing a team believes is slowing them down and the thing actually slowing them down are different often enough that we stopped assuming.",
        ],
      },
      {
        index: "02",
        title: "Something runs in the first month",
        paragraphs: [
          "Not a prototype, not a demo environment — something narrow, in production, doing real work. It will not be the whole system. It will be the piece that pays for the rest.",
          "Long build cycles hide bad assumptions. If we have got the shape wrong we would rather find out in week four with something small than in month six with something large.",
        ],
      },
      {
        index: "03",
        title: "Then we watch it break",
        paragraphs: [
          "The real world always finds something. A customer phrases a question in a way nobody predicted; an integration returns a field that is null on Tuesdays; someone uses the tool in a way the playbook never described.",
          "That is not failure, it is the second half of the job. The tuning period after launch is where a system stops being impressive and starts being trusted.",
        ],
      },
      {
        index: "04",
        title: "We will tell you not to build it",
        paragraphs: [
          "Some work should stay with a person. Low volume, high consequence, requires judgement about a specific human being — automate that and you have saved an hour a week and bought a category of problem you cannot see coming.",
          "We have talked more than one team out of the project they came to us with. It costs us the engagement and it is still the right call, because the alternative is a system nobody uses and a reference we cannot give.",
        ],
      },
    ],
  },
  statement: {
    index: "03",
    eyebrow: "The short version",
    headline: "No decks. No discovery phase that costs more than the build.",
    body: "We're engineers, not a consultancy with an engineering department. The first thing you get from us is a map of your own workflow you did not have before, and the second is something running.",
  },
} satisfies AboutCopy);
