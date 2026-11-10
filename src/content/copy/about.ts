import { z } from "zod";

/**
 * `/about`.
 *
 * The page someone opens when they are deciding whether we are real. So it
 * answers that: what we are for, the three parts the company is divided into,
 * and what anyone dealing with us can hold us to. Prose rather than a
 * manifesto — a page of adjectives about ourselves would prove the opposite of
 * what it claims.
 *
 * **What we sell is not on this page.** It was, until 2026-10-07: the
 * offerings and the method made up the back half of `/about`, so the page said
 * who we are and then turned into a price list. They are `/services` now, with
 * `src/content/copy/services.ts` behind them.
 *
 * The mission and the vision are the last two lit sections of the charter.
 * They were also set large in a block of their own at the top of the page,
 * and on `/`; the owner cut both (2026-10-07) — said once, in the charter, is
 * enough.
 */

const aboutCopySchema = z.object({
  meta: z.object({ title: z.string(), description: z.string() }),
  header: z.object({
    headline: z.string(),
    lead: z.string(),
    photo: z.object({ src: z.string(), alt: z.string() }).optional(),
  }),
  /**
   * Who we are — the three parts explained, and what they commit us to.
   *
   * Three of the sections are `spotlight: true` — the horizon, the vision and
   * the mission: see the note in `src/modules/blocks/charter/index.tsx`.
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
  /** What anyone dealing with us — client, peer or student — can hold us to. */
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
    description:
      "Godwin Austen is a company, a laboratory and a school: Services, the Labs and the Academy.",
  },
  header: {
    headline: "A company, a laboratory and a school.",
    lead: "Godwin Austen is three things under one name. Services builds AI systems for the teams who hire us. The Labs is where the research happens. The Academy teaches what we find to the next generation, free. This page is who we are; what we sell has a page of its own.",
    // No photograph. The wire picture went to `/services` with the headline it
    // was chosen for, and the charter below opens on the globe — a second
    // picture a screen above it would be two openings.
  },
  charter: {
    index: "01",
    eyebrow: "Who we are",
    headline: "We exist to move the line on what is possible.",
    figure: "/assets/plates/globe.jpg",
    backdrop: "/assets/plates/hands.png",
    lead: [
      "Most companies in this industry are only a company: they build what was specified, bill for it, and learn nothing they were not told. We are that, and we are a laboratory, and we are a school, and it is worth saying plainly which is which.",
      "Services is the part people pay for. The Labs and the Academy are why it is any good.",
    ],
    sections: [
      {
        index: "01",
        title: "Services — the part that pays for the week",
        pull: "You are not buying hours. You are buying the range to know what is possible.",
        paragraphs: [
          "We build AI systems for teams whose work costs them more time than it should: your workflow, mapped properly, automated with the sharpest thing that will survive contact with your actual data — and with the parts that should stay human left alone, which is most of the skill.",
          "When a client describes a problem, the useful question is not whether we have done it before. It is whether we know where the current limit sits and how far their problem is from it. That is a laboratory question, and it is the reason the other two parts exist.",
        ],
      },
      {
        index: "02",
        title: "The Labs — where the research happens",
        pull: "The work with no client attached to it is the work that finds the ceiling.",
        paragraphs: [
          "A standing part of every week goes on work with no client attached to it: an idea taken apart to see what it is made of, a technique pushed until it breaks, a thing built to find out whether it can be built at all. Most of it has no customer and never will.",
          "A fraction becomes the work we sell the following year. The rest is how we find out where the ceiling actually sits, as opposed to where the industry has quietly agreed to put it. In a field moving this fast, a company that only builds what it was asked for is standing still.",
        ],
      },
      {
        index: "03",
        title: "The Academy — where it is taught, free",
        pull: "A system built to the slowest pace in the room holds everyone to it. We build to the highest.",
        paragraphs: [
          "Most education today is run as a business, and a business has to scale. So the system is set to the level of the least capable person in it, and everyone else is held there too — the curious, the bored, and the ones who were already ahead.",
          "The Academy works the other way round. Each person is taken to the highest limit they can reach, not the lowest one everyone can share: sharper thinking, and the judgement and self-awareness to use it well. Raising both the IQ and the EQ of this generation is how the centre of research and innovation ends up inside us rather than somewhere else.",
          "What the Labs finds out goes there first, and it costs nothing. A method one company holds raises that company. A method a generation holds raises the standard everyone has to meet, ourselves included.",
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
        title: "Vision — redefine the systems we inherited",
        pull: "A generation gets the ceiling its sharpest people will accept.",
        paragraphs: [
          "How innovation happens, how knowledge is taught, and what any of it is for were all decided before we arrived, mostly somewhere else, and mostly for someone else. None of it is a law of nature. All of it can be built again by people willing to do the work in the open.",
          "That is the generation we want to be part of: one that takes on difficult, unproven work because it is interesting rather than because somebody signed it off, publishes what it learned, and raises the standard simply by working above it.",
        ],
      },
      {
        index: "06",
        spotlight: true,
        title: "Mission — bring the centre back inside",
        pull: "Research is not something that happens elsewhere and arrives here late.",
        paragraphs: [
          "For most of the people we grew up with, the centre of research and innovation was somewhere else: a lab abroad, a company abroad, a paper you read a year after it mattered. Our mission is to be that centre — and to put it back where it belongs, inside ourselves, rather than wait for it to arrive.",
          "Part of that is replacing the education system we were handed with a more refined one — one that raises people to their limit instead of lowering them to the average. That is what the three parts are for: Services pays for it, the Labs does it, and the Academy makes sure it does not stop with us.",
        ],
      },
    ],
  },
  expectations: {
    index: "02",
    eyebrow: "What to expect from us",
    headline: "What you can hold us to.",
    sections: [
      {
        index: "01",
        title: "Something running, not something presented",
        paragraphs: [
          "If you hire us, the first thing you get is a map of your own workflow you did not have before, and the second is something in production. Not a deck and not a demo environment.",
          "And if the honest answer is that it should not be automated, you will hear that from us first — including when it costs us the engagement.",
        ],
      },
      {
        index: "02",
        title: "What we found, said plainly",
        paragraphs: [
          "The Labs publishes what it learns, including what did not work. A result nobody else can read is a result nobody else can check, and we would rather be corrected in public than be right in private.",
        ],
      },
      {
        index: "03",
        title: "The method, given away",
        paragraphs: [
          "Anything the Academy teaches is free. There is no paid tier behind it and no course that turns out to be a sales funnel at the end. If you are hungry and building something, that is the whole of the entry requirement.",
        ],
      },
      {
        index: "04",
        title: "People left where people belong",
        paragraphs: [
          "Across all three, the same rule: the systems stop where judgement starts and hand over with the context attached. Nothing we make is worth anything if the answer to who it freed up, and for what, is nobody.",
        ],
      },
    ],
  },
  statement: {
    index: "03",
    eyebrow: "The short version",
    headline: "Each part is why the other two are any good.",
    body: "Services pays for the week. The Labs finds out where the ceiling actually is. The Academy makes sure what we learn does not stay with us. Take any one of them away and the other two get worse.",
  },
} satisfies AboutCopy);
