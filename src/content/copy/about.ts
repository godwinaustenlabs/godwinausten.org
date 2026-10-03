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
  /**
   * Who we are — the ambition, and what it commits us to.
   *
   * The one section on the site that states where this is going rather than
   * what it does this quarter. It sits between the three tiles and the
   * offerings on purpose: a reader who has just been told *how* we work is the
   * one most likely to wonder what for, and the answer to that has to land
   * before the price list does.
   *
   * Three of the sections are `spotlight: true` — the horizon, the vision and
   * the mission. Those were a row of three cards under the prose and are now
   * part of it: see the note in `src/modules/blocks/charter/index.tsx`.
   */
  charter: z.object({
    index: z.string(),
    eyebrow: z.string(),
    headline: z.string(),
    lead: z.array(z.string()).min(1),
    figure: z.string().optional(),
    backdrop: z.string().optional(),
    sections: z
      .array(
        z.object({
          index: z.string(),
          title: z.string(),
          paragraphs: z.array(z.string()).min(1),
          /** The section's thesis, set large beside the prose. Never a line
              lifted out of it — see the block's `pull` field. */
          pull: z.string().optional(),
          spotlight: z.boolean().optional(),
        }),
      )
      .min(1),
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
    cta: z.object({ label: z.string(), href: z.string() }),
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
    lead: "We're a handful of engineers who got tired of watching good people do repetitive work. So we build the software that does it instead. No decks, no six-month roadmaps. Just systems that ship.",
    photo: {
      src: "/assets/photo/wire-dark.jpg",
      alt: "A pile of black wires resting on each other",
    },
  },
  charter: {
    index: "01",
    eyebrow: "Who we are",
    headline: "We exist to move the line on what is possible.",
    figure: "/assets/plates/globe.jpg",
    backdrop: "/assets/plates/hands.png",
    lead: [
      "Godwin Austen Labs is three things at once, and it is worth saying plainly which is which. We are a company: we build AI systems for clients whose work costs them more time than it should, and they pay us for it. We are a laboratory: a standing part of every week goes on things nobody ordered. And we are a school.",
      "Most companies in this industry are only the first of those. The other two are why the first is any good.",
    ],
    sections: [
      {
        index: "01",
        title: "The laboratory is not a marketing department",
        pull: "The work with no client attached to it is the work that finds the ceiling.",
        paragraphs: [
          "A standing part of every week goes on work with no client attached to it: an idea taken apart to see what it is made of, a technique pushed until it breaks, a thing built to find out whether it can be built at all. Most of it has no customer and never will.",
          "A fraction becomes the work we sell the following year. The rest is how we find out where the ceiling actually sits, as opposed to where the industry has quietly agreed to put it. A company that only builds what has already been specified never learns anything it was not told, and in a field moving this fast that is the same as standing still.",
        ],
      },
      {
        index: "02",
        title: "What that buys the people who hire us",
        pull: "You are not buying hours. You are buying the range to know what is possible.",
        paragraphs: [
          "Range, mostly. When a client describes a problem, the useful question is not whether we have done it before — it is whether we know what the current limit is and how far their problem sits from it. That is a laboratory question, and the teams who cannot answer it end up quoting for the thing they already know how to build.",
          "So the work we sell is unglamorous on purpose and ambitious where it counts: your workflow, mapped properly, automated with the sharpest thing that will survive contact with your actual data — and with the parts that should stay human left alone, which is most of the skill.",
        ],
      },
      {
        index: "03",
        title: "Godwin Austen Academy",
        pull: "Teaching it away is not charity. It is the only way the standard moves.",
        paragraphs: [
          "The method leaves this building. The Academy is where it goes to our peers, and to students who are hungrier than the syllabus they were handed — the ones already building things nobody assigned them.",
          "We do not charge for the part that should be free. A method one company holds raises that company. A method a generation holds raises the standard everyone has to meet, ourselves included, and that is the trade we would rather have.",
        ],
      },
      {
        index: "04",
        spotlight: true,
        title: "The 100-year plan",
        pull: "It changes which decisions we are willing to lose money on.",
        paragraphs: [
          "Build something that outlives everyone currently inside it. Most companies are a bet on a decade and are optimised accordingly — hire for the quarter, ship for the year, sell before the interesting part. This one is a bet on what compounds: the method, written down, taught, and handed on.",
          "It does not fit on a roadmap and we have not tried to put it on one. What it changes is which decisions we are willing to lose money on.",
        ],
      },
      {
        index: "05",
        spotlight: true,
        title: "Vision — a generation that does not wait for permission",
        pull: "A country gets the ceiling its sharpest people will accept.",
        paragraphs: [
          "People who take on difficult, unproven, unglamorous work because it is interesting rather than because somebody signed it off. Who publish what they learned. Who raise what everyone else treats as an acceptable standard simply by working above it in the open.",
          "A country gets the ceiling its sharpest people are willing to accept. We would rather be part of the generation that refuses the one it was handed and goes to find a higher one.",
        ],
      },
      {
        index: "06",
        spotlight: true,
        title: "Mission — give the week back, then say how",
        pull: "Returning the week is half the job. Saying how is the other half.",
        paragraphs: [
          "Take the work that costs a good team its week and return the week. Then explain exactly how it was done: to the client, to our peers, and to the Academy.",
          "That second half is the part most of this industry leaves out, and it is the only reason the first half is worth anything beyond the company it was done for.",
        ],
      },
    ],
  },

  services: {
    index: "02",
    eyebrow: "What we do",
    headline: "What we offer.",
    rows: [
      {
        index: "01",
        title: "Full Agentic AI Systems",
        figure: "/assets/diagrams/swarm.svg",
        detail:
          "We will build you the whole operation: agents that hold context, decide inside your rules, and hand off to each other and to a person. A system, not a chatbot on top of one.",
      },
      {
        index: "02",
        title: "Micro Agents & Bots for Task Automation",
        figure: "/assets/diagrams/micro.svg",
        detail:
          "We will take one task off your team and have it live in a week. You get one bot that does that job and stops. Cheap to add without a project, simple to remove.",
      },
      {
        index: "03",
        title: "AI Powered Pipelines",
        figure: "/assets/diagrams/pipeline.svg",
        detail:
          "We will build the line that takes work in at one end and returns it finished: enriched, classified, drafted, routed. The volume nobody wants to look at, handled.",
      },
      {
        index: "04",
        title: "Custom Solutions for SaaS and Enterprises",
        figure: "/assets/diagrams/integration.svg",
        detail:
          "We will build it inside your product or your stack. You get AI features your customers use, wired through the CRM, helpdesk and compliance path you already run.",
      },
    ],
    cta: { label: "Contact us", href: "/contact" },
  },
  method: {
    index: "03",
    eyebrow: "How we work",
    headline: "We ship, then we tune.",
    sections: [
      {
        index: "01",
        title: "Week one is watching, not building",
        paragraphs: [
          "Every engagement starts with us sitting with the work. Not a workshop. The actual work, as it happens, with the people who do it.",
          "It is the least glamorous week and the one that decides whether the rest is worth anything. The thing a team believes is slowing them down and the thing actually slowing them down are different often enough that we stopped assuming.",
        ],
      },
      {
        index: "02",
        title: "Something runs in the first month",
        paragraphs: [
          "Not a prototype, not a demo environment. Something narrow, in production, doing real work. It will not be the whole system. It will be the piece that pays for the rest.",
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
          "Some work should stay with a person. Low volume, high consequence, requires judgement about a specific human being. Automate that and you have saved an hour a week and bought a category of problem you cannot see coming.",
          "We have talked more than one team out of the project they came to us with. It costs us the engagement and it is still the right call, because the alternative is a system nobody uses and a reference we cannot give.",
        ],
      },
    ],
  },
  statement: {
    index: "04",
    eyebrow: "The short version",
    headline: "No decks. No discovery phase that costs more than the build.",
    body: "We're engineers, not a consultancy with an engineering department. The first thing you get from us is a map of your own workflow you did not have before, and the second is something running.",
  },
} satisfies AboutCopy);
