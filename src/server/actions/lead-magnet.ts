"use server";

import { z } from "zod";
import { cf } from "@/lib/cloudflare";
import { mediaHref } from "@/server/media";

/**
 * The lead-magnet opt-in.
 *
 * This is the page's one conversion, so the boundary is strict: the action
 * re-validates everything, and the client's own validation is treated as a
 * convenience for the visitor rather than a guarantee.
 *
 * **Captured leads go to Pleiades**, the company's own system, as a lead in
 * Acquisition — `POST /api/acquisition/contacts/intake`. That answers the
 * question this file carried unanswered for a month: there is no database *here*
 * and there does not need to be one, because the place these belong already
 * exists and the team already works in it. No D1, no Durable Object, no table on
 * the marketing site.
 *
 * Until that endpoint existed, a submission was validated, its DOMAIN logged, and
 * the address thrown away. Every lead captured before 2026-10-02 is gone; there is
 * nothing to backfill from.
 */

const submissionSchema = z.object({
  email: z.email().max(254),
  /**
   * Honeypot. Real people never see this field, so anything in it is a bot.
   * Cheaper and less hostile than a captcha, and it costs the visitor nothing.
   *
   * Accepts ANY string, deliberately. It was `.max(0)`, which made a filled
   * honeypot fail the parse — so the branch below that exists to swallow it
   * silently was unreachable, and a bot got a visible error message instead. A
   * bot that knows it failed simply tries again with the field left blank, which
   * is the one outcome the honeypot is there to avoid. Catching it here and
   * answering "success" is what makes it a trap rather than a hint.
   */
  company: z.string().optional(),
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
  } catch (error) {
    // The record failed, not the guide. Someone who has just typed their
    // address to get a PDF should get the PDF: withholding it to punish our own
    // outage loses the conversion and teaches the visitor nothing.
    //
    // Logged loudly, because this is now the one path where a real lead is
    // dropped — before, there was nothing to drop.
    console.error(
      JSON.stringify({
        event: "lead_magnet.delivery_failed",
        domain: parsed.data.email.slice(parsed.data.email.indexOf("@") + 1),
        message: error instanceof Error ? error.message : "unknown",
        at: new Date().toISOString(),
      }),
    );
    return { status: "success", href: DOWNLOAD };
  }
}

/**
 * Which magnet this was, sent along so the lead says where it came from.
 *
 * In Pleiades this lands in `lead_source` and on the lead's activity trail,
 * because "came in through the playbook" is the fact that makes the lead worth
 * calling — and it is lost if it only ever existed in a log line.
 */
const LEAD_SOURCE = "Lead magnet — Get Your Week Back";

/**
 * Hands the lead to Pleiades.
 *
 * ## Why a fetch and not a database
 *
 * The lead belongs in Acquisition, which already exists, already has a leads
 * screen and is already where somebody would go to work it. A table on the
 * marketing site would be a second copy of a thing the company owns, and
 * somebody would have to remember to look at it.
 *
 * ## Why a failure here is not the visitor's problem
 *
 * The caller treats any throw as success and still serves the PDF. Someone who
 * has just typed their address to get a guide should get the guide; withholding
 * it to punish our own outage loses the conversion and teaches the visitor
 * nothing. The cost of that trade is explicit: **if Pleiades is unreachable, the
 * lead is lost** — logged below, and not queued for retry. A queue is the right
 * answer if that ever happens often enough to matter, and is deliberately not
 * being built on speculation.
 *
 * ## The credential
 *
 * `PLEIADES_API_KEY` is an `api_keys` row in Pleiades naming a login that holds
 * exactly one grant — `acquisition/contacts` edit. It can create a lead and it
 * cannot read a payslip, and the login itself cannot sign in at all. So a leak
 * here is leads, not the company.
 */
async function deliver(email: string): Promise<void> {
  const { env } = cf();
  const base = env.PLEIADES_API_URL;
  const key = env.PLEIADES_API_KEY;

  // Log the domain either way, which is what the funnel is measured on and the
  // only thing that was ever recorded here. Never the address: that is the
  // visitor's, and it is now held in one place rather than two.
  const domain = email.slice(email.indexOf("@") + 1);

  if (!base || !key) {
    // Unconfigured is not an error to throw — it is the state a preview deploy
    // is in, and it must not take the download with it.
    console.log(
      JSON.stringify({
        event: "lead_magnet.request",
        domain,
        delivered: false,
        reason: "PLEIADES_API_URL or PLEIADES_API_KEY is unset",
        at: new Date().toISOString(),
      }),
    );
    return;
  }

  const response = await fetch(`${base.replace(/\/+$/, "")}/api/acquisition/contacts/intake`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key },
    body: JSON.stringify({ email, source: LEAD_SOURCE }),
    // A visitor is waiting on this before their download starts, so it does not
    // get to hang. The caller's catch turns a timeout into a served PDF.
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new Error(`Pleiades intake returned ${response.status}`);
  }

  const body = (await response.json().catch(() => null)) as { data?: { repeat?: boolean } } | null;
  console.log(
    JSON.stringify({
      event: "lead_magnet.request",
      domain,
      delivered: true,
      // Pleiades is idempotent on email, so a second download is one lead and a
      // new activity row. Worth seeing in the logs as a repeat rather than a new
      // capture, or the funnel's numbers read better than they are.
      repeat: body?.data?.repeat === true,
      at: new Date().toISOString(),
    }),
  );
}
