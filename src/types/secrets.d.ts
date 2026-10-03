/**
 * Worker SECRETS, declared by hand.
 *
 * `wrangler types` reads `wrangler.jsonc`, and secrets are deliberately not in
 * that file — they are set with `npx wrangler secret put <NAME> --name site`. So
 * the generated `cloudflare-env.d.ts` knows every binding and every `vars` entry
 * and none of the secrets, and anything reading one is a type error until it is
 * declared here.
 *
 * That is a feature rather than a nuisance: this file is the committed list of
 * what the deployment expects to be set, which `cloudflare-env.d.ts` cannot be
 * because it is generated and git-ignored. A secret that exists in production and
 * not here is invisible to TypeScript; one here and not in production is a
 * `undefined` at runtime, which is why every reader below has to handle absence.
 *
 * `Cloudflare.Env` and `CloudflareEnv` are both open interfaces in the generated
 * file, so this augments rather than replaces — regenerating the types does not
 * discard it.
 *
 * Keep in step with `.dev.vars.example`, which is the human-readable half.
 */

interface __SiteSecrets {
  /**
   * Pleiades API key for handing a captured lead to Acquisition.
   *
   * An `api_keys` row in Pleiades naming a login that holds exactly one grant —
   * `acquisition/contacts` edit — and cannot sign in at all. A leak here creates
   * leads; it does not read a payslip.
   *
   * **Optional on purpose.** Unset, the lead-magnet opt-in still serves the PDF
   * and logs that it could not deliver, which is the state a preview deploy is in
   * and must not be a 500 on the funnel's one conversion.
   */
  PLEIADES_API_KEY?: string;
}

/*
 * Declaration merging, which is what makes this additive: the generated file's
 * `Cloudflare.Env` and `CloudflareEnv` are open interfaces, so re-opening them
 * here adds to them rather than replacing them, and `npm run cf:typegen` does
 * not discard this.
 *
 * `no-empty-object-type` is disabled rather than worked around: an interface with
 * no members of its own is precisely the mechanism, and the usual fix — a type
 * alias with an intersection — cannot merge into an existing interface at all.
 */
declare namespace Cloudflare {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Env extends __SiteSecrets {}
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface CloudflareEnv extends __SiteSecrets {}
