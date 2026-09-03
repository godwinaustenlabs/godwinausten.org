import { z } from "zod";

/**
 * Every string on the home page, in one place.
 *
 * ## The flow
 *
 * hook → proof → mechanism → **the ask** → the long version → contact.
 *
 * Each panel ends by handing to the next one — a `next` line naming what comes
 * after it. That is the connective tissue: a reader is never at the end of a
 * section wondering whether the page is over, and the running index in every
 * eyebrow bar tells them where they are. Sections that simply stop are what
 * makes a scroll feel like a stack of unrelated pages.
 *
 * The opt-in comes before the video. By then the reader has seen one thing we
 * built and how we build it — the peak of their willingness — and what we ask
 * for is one field with no call attached. The video follows for whoever wants
 * the long version.
 *
 * ## Every panel is one screen
 *
 * A panel is exactly the band between the fixed bars and does not grow, so copy
 * is written to a budget rather than trimmed afterwards. `tests/unit` holds the
 * ceilings. Anything longer belongs on a sub-route.
 *
 * Voice: confident, dry, human. Short sentences. Banned: "agentic", "leverage",
 * "seamless", "cutting-edge", "robust", and "case study" — we build
 * **experiences**. No invented statistics, ever. See docs/brief.md.
 */

const linkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

/** The hand-off line at the foot of a panel. */
const nextSchema = z.object({ index: z.string(), label: z.string(), href: z.string() });

const homeCopySchema = z.object({
  hero: z.object({
    /** One array entry per rendered line. Line breaks are a design decision. */
    headlineLines: z.array(z.string()).min(1),
    subhead: z.string(),
    primary: linkSchema,
    secondary: linkSchema,
    place: z.string(),
    scrollHint: z.string(),
  }),
  experience: z.object({
    index: z.string(),
    eyebrow: z.string(),
    headline: z.string(),
    lead: z.string(),
    card: z.object({
      eyebrow: z.string(),
      client: z.string(),
      name: z.string(),
      body: z.string(),
      notes: z.array(z.object({ label: z.string(), value: z.string() })).min(1),
      videoLabel: z.string(),
      src: z.string().optional(),
      cta: linkSchema,
    }),
    next: nextSchema,
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
          /** The offering as a claim, set in display type above the detail. */
          claim: z.string().optional(),
          /** Schematic of this offering. See scripts/generate-diagrams.mjs. */
          figure: z.string().optional(),
        }),
      )
      .min(1),
    next: nextSchema,
  }),
  magnet: z.object({
    index: z.string(),
    eyebrow: z.string(),
    /** What the thing is, in as few words as possible. */
    kicker: z.string(),
    headline: z.string(),
    body: z.string(),
    contents: z.array(z.string()).min(1),
    /** Set on the cover tile, so the offer reads as an object you receive. */
    cover: z.object({ title: z.string(), format: z.string() }),
    /** The loud button, shown before the field. */
    cta: z.string(),
    /** Asked once the button has been pressed. */
    prompt: z.string(),
    placeholder: z.string(),
    submit: z.string(),
    /** Manual download link in the success state. */
    again: z.string(),
    micro: z.string(),
    success: z.string(),
    successBody: z.string(),
    next: nextSchema,
  }),
  mark: z.object({
    index: z.string(),
    eyebrow: z.string(),
    headline: z.string(),
    body: z.string(),
    hint: z.string(),
    next: nextSchema,
  }),
  vsl: z.object({
    index: z.string(),
    eyebrow: z.string(),
    headline: z.string(),
    body: z.string(),
    videoLabel: z.string(),
    /**
     * What the film covers, in order — with no timecodes.
     *
     * It used to carry `00:00 / 01:05 / …`. Those were invented, and they would
     * still be on the page pointing at the wrong moments the day a real cut is
     * uploaded. The order is the useful part; the timings are a maintenance
     * liability.
     */
    covers: z.array(z.string()).min(1),
    src: z.string().optional(),
    next: nextSchema,
  }),
});

export type HomeCopy = z.infer<typeof homeCopySchema>;

export const homeCopy: HomeCopy = homeCopySchema.parse({
  hero: {
    headlineLines: ["we build teams", "that never", "clock out."],
    subhead: "AI systems for sales, service & ops.",
    primary: { label: "See the work", href: "#experience" },
    secondary: { label: "Get the playbook", href: "#playbook" },
    place: "Pakistan",
    scrollHint: "Scroll",
  },

  experience: {
    index: "01",
    eyebrow: "Proof",
    headline: "We have shipped this.",
    lead: "Not a pilot and not a demo — a system doing real work inside a real company, every day, since we handed it over.",
    card: {
      eyebrow: "An experience",
      client: "faayy.shop",
      name: "The Picasso Experience",
      body: "Narrow agents that write the listings, answer what the catalogue can answer, and hand the rest to a human with the context attached.",
      notes: [
        { label: "Shape", value: "Catalogue, support, escalation" },
        { label: "Status", value: "In production" },
      ],
      videoLabel: "Demo reel",
      cta: { label: "Read the full experience", href: "/work" },
    },
    next: { index: "02", label: "How it gets built", href: "#expertise" },
  },

  services: {
    index: "02",
    eyebrow: "How it gets built",
    headline: "Three ways we plug in.",
    rows: [
      {
        index: "01",
        title: "Workflow Mapping",
        detail:
          "We sit with the work before we automate it. Half of what teams ask for turns out not to be the thing costing them.",
        claim: "We watch before we build.",
        figure: "/assets/diagrams/mapping.svg",
      },
      {
        index: "02",
        title: "Agent Swarms",
        detail:
          "Chat, voice, outbound. Narrow agents that hand off to each other, built on your playbooks rather than a generic prompt.",
        claim: "Many small agents, not one big one.",
        figure: "/assets/diagrams/swarm.svg",
      },
      {
        index: "03",
        title: "Systems Integration",
        detail:
          "Wired into the CRM and helpdesk you already use. Nobody should copy anything between two screens.",
        claim: "Nothing new to log into.",
        figure: "/assets/diagrams/integration.svg",
      },
    ],
    next: { index: "03", label: "What to automate first", href: "#playbook" },
  },

  magnet: {
    index: "03",
    eyebrow: "Free guide",
    kicker: "Free — no call, no sequence",
    headline: "Steal our day-one worksheet.",
    body: "The four questions we ask before writing a line of code. Most teams find the expensive thing is not the one they were about to pay us to fix.",
    contents: [
      "The four questions that price a workflow",
      "How to spot the task that only looks expensive",
      "The three failure modes that kill agent projects",
    ],
    cover: { title: "What to automate first", format: "PDF — 9 pages" },
    cta: "Download it free",
    prompt: "Where do we send it?",
    placeholder: "you@company.com",
    submit: "Send it",
    micro: "One email. Nothing else, ever.",
    success: "Downloading now.",
    successBody:
      "It should be in your downloads. We'll email the updated version when there is one.",
    again: "Download again",
    next: { index: "04", label: "Watch the whole thing", href: "#watch" },
  },

  vsl: {
    index: "04",
    eyebrow: "The long version",
    headline: "Watch us replace a hiring plan.",
    body: "The workflow we mapped, what we built, and what it costs to run. No slides.",
    videoLabel: "Demo reel",
    covers: [
      "The workflow, on a whiteboard",
      "What we automated, and what we left",
      "The handoff to a human",
      "What it costs to run",
    ],
    next: { index: "05", label: "Who's behind it", href: "#who" },
  },

  mark: {
    index: "05",
    eyebrow: "Who's behind it",
    headline: "We would rather be useful than impressive.",
    body: "A handful of engineers in Pakistan who like the unglamorous half of the work: the week spent watching, the handoff nobody wrote down, the thing that breaks on a Tuesday. We build what survives being used every day by people who did not ask for it — and we will tell you when a problem does not need us.",
    hint: "Move your cursor",
    next: { index: "06", label: "Talk to us", href: "#contact" },
  },
} satisfies HomeCopy);
