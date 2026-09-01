import { z } from "zod";

/**
 * `/work` — the index page's own framing.
 *
 * The experiences themselves live in `src/content/work/experiences.ts`, one
 * module-worth per build, because each is both a row here and the whole of its
 * own `/work/[slug]` page. This file is only the words around them.
 */

const workCopySchema = z.object({
  meta: z.object({ title: z.string(), description: z.string() }),
  header: z.object({
    eyebrow: z.string(),
    headline: z.string(),
    lead: z.string(),
    meta: z.array(z.string()),
    photo: z.object({ src: z.string(), alt: z.string() }).optional(),
  }),
  indexHeading: z.string(),
});

export type WorkCopy = z.infer<typeof workCopySchema>;

export const workCopy: WorkCopy = workCopySchema.parse({
  meta: {
    title: "Work",
    description: "Systems we have shipped, and what each one actually does.",
  },
  header: {
    eyebrow: "Work",
    headline: "Systems in production.",
    lead: "We would rather show you one build in full than four thumbnails you cannot judge. Each of these is running inside a real company right now — open one to see how it was decided, built, and what we left alone.",
    meta: ["Lahore, PK", "Est. 2024"],
    photo: { src: "/assets/photo/trails.jpg", alt: "Long-exposure light trails in blue" },
  },
  indexHeading: "Selected work /",
} satisfies WorkCopy);
