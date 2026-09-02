"use server";

import { z } from "zod";
import { mediaHref } from "@/server/media";

/**
 * The lead-magnet opt-in.
 *
 * This is the page's one conversion, so the boundary is strict: the action
 * re-validates everything, and the client's own validation is treated as a
 * convenience for the visitor rather than a guarantee.
 *
 * **It does not persist anything yet, on purpose.** There is no database, and
 * adding one to store a single email is exactly the improvisation CLAUDE.md §5
 * forbids — the D1-vs-Durable-Object decision is the owner's, and the criteria
 * live in docs/data-layer.md. Until that is made, a submission is validated and
 * logged, which is visible in `npm run cf:tail`. Wiring this to a real
 * destination is a change to `deliver()` below and nothing else.
 */

const submissionSchema = z.object({
  email: z.email().max(254),
  /**
   * Honeypot. Real people never see this field, so anything in it is a bot.
   * Cheaper and less hostile than a captcha, and it costs the visitor nothing.
   */
  company: z.string().max(0).optional(),
});

export type LeadMagnetState =
  | { status: "idle" }
  /** `href` is the download the client should start. See `mediaHref`. */
  | { status: "success"; href: string }
  | { status: "error"; message: string };

const GENERIC_ERROR = "That didn't go through. Try again, or email us directly.";

/**
 * Where a successful opt-in sends the visitor.
 *
 * The URL is not a secret and is not meant to be: the gate here is the form,
 * not cryptography. Anyone who finds this path can fetch the guide without
 * giving us an address, which is true of every ungated lead magnet on the
 * internet and is the trade every one of them makes — a signed, expiring link
 * would cost a new secret, a launch blocker, and a support burden, to protect a
 * PDF we are actively trying to give away.
 *
 * What *is* controlled is which object it can reach: `MEDIA_ASSETS` is an
 * allowlist, so this path serves the playbook and nothing else in the bucket.
 */
const DOWNLOAD = mediaHref("playbook", { download: true });

export async function requestPlaybook(
  _previous: LeadMagnetState,
  formData: FormData,
): Promise<LeadMagnetState> {
  const parsed = submissionSchema.safeParse({
    email: formData.get("email"),
    company: formData.get("company") ?? "",
  });

  if (!parsed.success) {
    // Do not echo the honeypot back as a validation error — that tells a bot
    // exactly which field caught it.
    const emailIssue = parsed.error.issues.find((issue) => issue.path[0] === "email");
    return {
      status: "error",
      message: emailIssue ? "That email doesn't look right." : GENERIC_ERROR,
    };
  }

  if (parsed.data.company) {
    // Silently succeed. A bot that knows it failed just tries again.
    return { status: "success", href: DOWNLOAD };
  }

  try {
    await deliver(parsed.data.email);
    return { status: "success", href: DOWNLOAD };
  } catch {
    // The record failed, not the guide. Someone who has just typed their
    // address to get a PDF should get the PDF: withholding it to punish our own
    // logging outage loses the conversion and teaches the visitor nothing.
    return { status: "success", href: DOWNLOAD };
  }
}

/**
 * The delivery seam. Replace the body when there is somewhere to send this —
 * an email provider, a CRM, or a table once the data-layer decision is made.
 */
async function deliver(email: string): Promise<void> {
  console.log(
    JSON.stringify({
      event: "lead_magnet.request",
      // Log the domain, not the address. The address is the visitor's; the
      // domain is all we need to see whether the funnel is reaching businesses.
      domain: email.slice(email.indexOf("@") + 1),
      at: new Date().toISOString(),
    }),
  );
}
