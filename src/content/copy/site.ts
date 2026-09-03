import { z } from "zod";
import { site } from "@/lib/site";

/**
 * Copy that is the same on every page: the wordmark, the nav, the corner meta.
 *
 * It lives apart from the per-page modules because it is genuinely shared —
 * duplicating the nav into three page files is how one of them ends up pointing
 * at a route that was renamed six months ago.
 */

const linkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

const siteCopySchema = z.object({
  wordmark: z.string(),
  /**
   * The rail at the foot of every page — the site's only navigation. Every
   * href is absolute, because the rail renders on every route and a bare
   * fragment would look for a section that is not on the current one.
   */
  nav: z.array(linkSchema),
  meta: z.object({ place: z.string(), founded: z.string() }),
  skipToContent: z.string(),
  /** Shared contact block — the same on every route it appears on. */
  contact: z.object({
    index: z.string(),
    eyebrow: z.string(),
    headline: z.string(),
    body: z.string(),
    channels: z.array(z.object({ label: z.string(), email: z.string() })),
  }),
});

export type SiteCopy = z.infer<typeof siteCopySchema>;

export const siteCopy: SiteCopy = siteCopySchema.parse({
  wordmark: "Godwin Austen Labs",
  nav: [
    { label: "Work", href: "/work" },
    { label: "About", href: "/about" },
    { label: "Playbook", href: "/#playbook" },
    { label: "Contact", href: "/contact" },
  ],
  meta: { place: "Pakistan", founded: "Est. 2024" },
  skipToContent: "Skip to content",
  contact: {
    index: "05",
    eyebrow: "Let's talk",
    headline: "Let's build something that works.",
    body: "Tell us what you're doing by hand that shouldn't be. We'll tell you if an agent can take it.",
    channels: [
      { label: "Work with us", email: site.email.work },
      { label: "Careers", email: site.email.careers },
    ],
  },
} satisfies SiteCopy);
