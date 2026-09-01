"use server";

import { z } from "zod";

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
  { status: "idle" } | { status: "success" } | { status: "error"; message: string };

const GENERIC_ERROR = "That didn't go through. Try again, or email us directly.";

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
    return { status: "success" };
  }

  try {
    await deliver(parsed.data.email);
    return { status: "success" };
  } catch {
    return { status: "error", message: GENERIC_ERROR };
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
