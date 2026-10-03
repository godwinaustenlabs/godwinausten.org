import { z } from "zod";
import { site } from "@/lib/site";

/**
 * `/careers`.
 *
 * It used to be one row on `/contact` — an address with a sentence beside it,
 * sitting between "work with us" and "everything else". That is the right amount
 * of room for a footnote and the wrong amount for the half of the company that
 * is people, and it made a job application a routing decision the reader had to
 * make before they could write anything.
 *
 * So it is its own page, and it is written for the reader it actually gets:
 * someone who has no idea whether we are hiring, does not have a conventional
 * CV, and will decide in about fifteen seconds whether we are the kind of place
 * worth writing to. It answers those in that order — we hire rarely, here is
 * what we look for instead of a CV, here is what is open, and write anyway if
 * nothing is.
 *
 * **The board is allowed to be empty.** `openRoles.roles` is a list and
 * `openRoles.closed` is what the page says when it is bare. Taking a role down
 * is deleting an entry here; it is not a code change and it must never become
 * one, because the alternative is a filled role advertised for six months.
 */

const careersCopySchema = z.object({
  meta: z.object({ title: z.string(), description: z.string() }),
  header: z.object({
    eyebrow: z.string().min(1).optional(),
    headline: z.string(),
    lead: z.string(),
    /*
      Optional, and `/careers` does not set it — the same call `/contact` made.

      The bar carried "Pakistan" and the careers address. Both are said properly
      further down: the address is the whole of the apply bar on every posting
      and the line under the board, and the place is in the meta of each role. A
      mono strip repeating them under the masthead is the page answering
      questions it is about to answer, and it separated the headline from the
      section that follows it with a rule that meant nothing.
    */
    meta: z.array(z.string()).optional(),
  }),
  /** The claim, beside the figure. What we look for when a CV cannot say it. */
  stance: z.object({
    index: z.string(),
    eyebrow: z.string(),
    headline: z.string(),
    body: z.string(),
    points: z.array(z.object({ index: z.string(), title: z.string(), detail: z.string() })).min(2),
  }),
  /** The board itself. */
  openRoles: z.object({
    index: z.string(),
    eyebrow: z.string(),
    headline: z.string(),
    lead: z.string(),
    apply: z.object({ label: z.string(), email: z.string(), note: z.string() }),
    /** The compensation terms, said once above the board. */
    terms: z.object({ title: z.string(), detail: z.string() }),
    roles: z.array(
      z.object({
        index: z.string(),
        title: z.string(),
        summary: z.string(),
        meta: z.array(z.string()).min(1),
        groups: z.array(z.object({ title: z.string(), items: z.array(z.string()).min(1) })).min(1),
      }),
    ),
    closed: z.object({ title: z.string(), detail: z.string() }),
  }),
  /** The print panel at the foot — the same block the home page's Labs uses. */
  invitation: z.object({
    index: z.string(),
    eyebrow: z.string(),
    headline: z.string(),
    body: z.string(),
    note: z.string(),
    apply: z.object({ label: z.string(), email: z.string() }),
    print: z.array(z.string()).min(1),
    next: z.object({ index: z.string(), label: z.string(), href: z.string() }),
  }),
});

export type CareersCopy = z.infer<typeof careersCopySchema>;

export const careersCopy: CareersCopy = careersCopySchema.parse({
  meta: {
    title: "Careers",
    description: "We hire rarely. When we do, we are looking for people who make things.",
  },
  header: {
    headline: "We hire rarely. We read everything.",
    lead: "There is no pipeline here, no recruiter and no portal that asks you to retype your CV into eleven boxes. When a seat opens it goes on this page, and it comes down the day it is filled.",
  },

  stance: {
    index: "01",
    eyebrow: "What we look for",
    headline: "Bring something you made.",
    body: "We are small enough that one hire is a large fraction of the company, which is why we take our time and why the thing we look hardest for is not experience. Show us something you built, wrote, shot, designed, or took apart to see how it worked — the side project, the spreadsheet that got out of hand, the account you grew for a friend. Two odd things you finished tell us more than five ordinary ones you were assigned.",
    points: [
      {
        index: "01",
        title: "You make things unasked",
        detail:
          "Nobody here is waiting to be handed a task. The best signal you can send us is something that exists only because you decided it should.",
      },
      {
        index: "02",
        title: "You finish them",
        detail:
          "Starting is cheap. We would rather see one small thing that is actually done than four that got interesting and then stopped.",
      },
      {
        index: "03",
        title: "You say what went wrong",
        detail:
          "Everything we build breaks in its first month. People who can describe their own mistakes plainly are the ones we can build with.",
      },
    ],
  },

  openRoles: {
    index: "02",
    eyebrow: "Open roles",
    headline: "What is open right now.",
    lead: "Both of these are internships, both are real work from the first week, and neither of them is a coffee run. You will be given a job the company actually needs doing and the room to be bad at it for a fortnight.",
    /*
      Said once, plainly, and above the postings rather than in the small print
      of each.

      We are asking people to work for commission with no floor under it, and the
      only honest way to ask that is to say so before they have read the job and
      started imagining themselves in it. Burying it in a benefits line at the
      bottom is how this gets done badly.
    */
    terms: {
      title: "What these pay, before you read any further",
      detail:
        "We are a young company and these two seats are voluntary and commission-based. There is no basic salary attached to either of them right now — you earn on what you bring in or what you ship, and nothing on top of it. That is not what we want it to be and it is not permanent: these become paid roles when the revenue they help build arrives. If that does not work for your situation, it does not, and we would rather you knew that in the first minute than the third interview.",
    },
    apply: {
      label: "Apply —",
      email: site.email.careers,
      note: "Attach a CV and one thing you made. The second one is what we read first",
    },
    roles: [
      {
        index: "01",
        title: "Sales Intern",
        summary:
          "You build the lists the rest of the work runs on. If the sheet is wrong, everything downstream of it is wasted — which is why this is not the junior job it sounds like.",
        meta: ["Internship", site.place, "Commission only"],
        groups: [
          {
            title: "What you'd do",
            items: [
              "Build lead sheets: who the company is, who to talk to there, and how to reach them.",
              "Work Apollo, Hunter, LinkedIn and Google Maps until a row is complete rather than nearly complete.",
              "Find and verify emails and phone numbers. A bounced address costs us more than an empty cell does.",
              "Keep the sheet clean — one format, no duplicates, and a note of where each row came from.",
              "Tell us when a list is not worth building. Half of this job is knowing which segment is a dead end.",
            ],
          },
          {
            title: "What you need",
            items: [
              "The basics of how outbound works. You do not need to have done it at scale, or at all professionally.",
              "Enough Apollo, Hunter or LinkedIn to find a person and their address without being walked through it.",
              "Google Sheets properly: filters, dedupes, and a formula or two of your own.",
              "Patience for small facts. Most of this work is being right about details nobody will thank you for.",
              "Written English good enough that a first-line message does not need rewriting.",
            ],
          },
        ],
      },
      {
        index: "02",
        title: "Marketing Intern",
        summary:
          "You run the accounts and you make what goes on them. Not a scheduler and a designer — one person who can have the idea and then build it.",
        meta: ["Internship", site.place, "Commission only"],
        groups: [
          {
            title: "What you'd do",
            items: [
              "Run the day to day on Instagram and LinkedIn: posting, scheduling, and answering what comes back.",
              "Make the creative yourself — the post, the carousel, the short cut — to a brief and to a deadline.",
              "Turn what we build into something a person outside this industry would stop scrolling for.",
              "Keep a calendar a week ahead and stick to it, so nothing goes out at midnight because it was forgotten.",
              "Watch what worked and say so honestly, including when the thing you made was the thing that did not.",
            ],
          },
          {
            title: "What you need",
            items: [
              "Working Canva, Figma or the Adobe equivalent — whichever one you are actually fast in.",
              "Basic video: trim, caption, and export at the right size for the platform without being told which.",
              "You have run an account before. Yours, a friend's, a university society's — all of it counts.",
              "An eye for when something looks cheap, and the willingness to argue for a version you believe in.",
              "Enough writing to make a caption land in one line.",
            ],
          },
        ],
      },
    ],
    closed: {
      title: "Nothing open at the moment.",
      detail:
        "This is the board's usual state and it is not a polite no. We open a seat when the work genuinely needs one, and the fastest way to be first in line is to already be in the inbox when it happens.",
    },
  },

  invitation: {
    index: "03",
    eyebrow: "Write anyway",
    headline: "The best hires never matched a posting.",
    body: "Every person here arrived with something odd attached — a project nobody asked for, a tool built to scratch one itch, a portfolio with no job title anywhere near it. If you have something like that and none of the roles above fit you, that is a reason to write rather than a reason not to.",
    note: "Tell us what you would build here.",
    apply: { label: "Send it to", email: site.email.careers },
    print: ["SHOW", "US", "SOMETHING", "STRANGE"],
    next: { index: "04", label: "Talk to us", href: "#contact" },
  },
} satisfies CareersCopy);
