# SECURITY.md

Security practices for `godwinausten.org`. This is a working document: it records
what is **enforced today**, what is **decided but not yet built**, and what is
**still open**. Anything not written here has not been thought about — say so
rather than assuming it is handled.

Report a vulnerability privately to **labs@godwinausten.org**. Do not open a
public issue.

---

## 1. Threat model (what we are actually defending)

This is a marketing site and a lead-capture funnel. It holds no user accounts and
no payment data. That shapes the priorities:

| Asset                                   | Why it matters                         | Primary risk                                               |
| --------------------------------------- | -------------------------------------- | ---------------------------------------------------------- |
| Lead submissions (name, email, message) | It is other people's personal data     | Exfiltration, spam/abuse of the endpoint                   |
| Cloudflare account credentials          | Full control of the Worker and buckets | Token leak in the repo or CI                               |
| The site's integrity                    | It is the company's public face        | Defacement via a compromised dependency or injected script |
| Funnel availability                     | Downtime is lost revenue               | Abuse-driven cost or rate exhaustion                       |

Explicitly **out of scope** for now: multi-tenant isolation, PCI, and anything
requiring user authentication. If any of those enter scope, this file is rewritten
before the code is.

---

## 2. Secrets

### The rule

| Kind               | Where it lives                              | How it is set                                |
| ------------------ | ------------------------------------------- | -------------------------------------------- |
| Production secret  | Cloudflare Secrets Store, per-Worker        | `npx wrangler secret put <NAME> --name site` |
| Local secret       | `.dev.vars` (git-ignored)                   | copied from `.dev.vars.example`              |
| Public build value | `vars` in `wrangler.jsonc` / `.env.example` | plain text — assume world-readable           |

### Non-negotiables

- **`NEXT_PUBLIC_*` is public.** It is inlined into the JavaScript every visitor
  downloads. Never put a key, token, or ID you would not print on a billboard
  behind that prefix.
- Never commit `.dev.vars`, `.env`, `.env.local`, `*.pem`, or `*.key`. `.gitignore`
  covers these; do not add exceptions.
- Never `console.log` an `env` value, and never return one from a route handler —
  including in an error message. Worker logs are readable in the dashboard.
- Never paste a secret into an AI tool, an issue, or a commit message.
- Audit what exists: `npm run cf:secrets`.

### If a secret leaks

1. Rotate it at the source immediately — revoking beats scrubbing.
2. `npx wrangler secret put <NAME> --name site` with the new value.
3. Rewriting git history is **not** remediation; assume the old value is public
   forever.
4. Record the incident in `docs/adr/` with the date and what changed.

---

## 3. Response headers

Set in the `headers()` block of `next.config.ts` for anything the Worker serves,
and in `public/_headers` for static assets that Workers Assets serves directly.

Not set in a `proxy.ts` (Next 16's renamed middleware): proxy is Node-runtime
only, and OpenNext flags Node middleware as experimental and unmaintained on
Cloudflare. If a future need genuinely requires per-request logic at the network
boundary, that trade-off gets an ADR first.

**Enforced today:**

| Header                       | Value                                 | Why                                                                            |
| ---------------------------- | ------------------------------------- | ------------------------------------------------------------------------------ |
| `x-content-type-options`     | `nosniff`                             | Stops MIME-confusion attacks on uploaded media                                 |
| `x-frame-options`            | `DENY`                                | No clickjacking of the funnel's CTAs                                           |
| `referrer-policy`            | `strict-origin-when-cross-origin`     | Don't leak funnel paths to third parties                                       |
| `permissions-policy`         | camera/mic/geolocation off            | Nothing here needs them                                                        |
| `cross-origin-opener-policy` | `same-origin`                         | Isolates the browsing context                                                  |
| `strict-transport-security`  | `max-age=63072000; includeSubDomains` | HTTPS-only. Browsers ignore it over plain HTTP, so it is sent unconditionally. |

**Required before the custom domain goes live — not yet built:**

- [ ] **Content-Security-Policy.** Deliberately absent: a CSP written before the
      real script, style, media, and analytics origins are known will either be
      so loose it is theatre or so tight it silently breaks the VSL player.
      Build it nonce-based, `default-src 'self'`, and roll it out
      `Content-Security-Policy-Report-Only` first.
- [ ] `preload` added to HSTS, and the domain submitted, only after the apex and
      every subdomain are confirmed HTTPS-only.
- [ ] `cross-origin-embedder-policy` — only if the VSL player tolerates it. Test
      before enabling; it breaks many third-party embeds.

`tests/e2e/smoke.spec.ts` asserts the enforced headers. Extend that test when a
header is added, so a regression fails CI rather than shipping.

---

## 4. Input handling

- **Every** external input — form body, query param, webhook payload, R2 object
  key — is parsed with a `zod` schema at the boundary before use. Never trust a
  shape you did not validate in the same function.
- Mutations go through **Server Actions**, not custom `POST` handlers, so Next.js
  origin checks apply. Body size is capped at 2 MB in `next.config.ts`.
- **R2 keys are attacker-controlled input.** Never interpolate a user value into
  a key without validating it against an allowlist pattern. Never derive a key
  from a path the user supplies (`../` has no meaning to R2, but a crafted key can
  read another tenant's prefix once we have prefixes).
- No raw HTML from user input. If rich text is ever needed, it is sanitised
  server-side with an allowlist — never `dangerouslySetInnerHTML` on submitted
  content.
- No SQL today. When D1 arrives: parameterised statements only, via Drizzle.
  String-concatenated SQL is an automatic review rejection.

---

## 5. The lead-capture endpoint

**Current state: built as a stub, and not cleared to ship.**

`requestPlaybook` in `src/server/actions/lead-magnet.ts` is a Server Action that
validates a submission and logs it. **It stores nothing and sends nothing** —
there is no database (`CLAUDE.md` §5) and no email provider wired up. The single
seam to change is `deliver()`.

The stub is deliberate and was asked for. It does **not** clear the list below,
and the list is what has to be true before the form is live on a public domain
with a real destination behind it.

- [ ] **Bot protection** — Cloudflare Turnstile, verified **server-side**. A
      client-side-only check is decoration.
- [ ] **Rate limiting** — per-IP, via Cloudflare's Rate Limiting rules or the
      Workers rate-limiting binding. Prevents both spam and cost abuse.
- [x] **No PII in logs.** The action logs the email's _domain_, the event name,
      and a timestamp — never the address, and there is no message body field.
      Enough to see whether the funnel is reaching businesses; not enough to
      identify anyone.
- [ ] **Explicit consent copy** next to the submit button, and a linked privacy
      policy that actually exists. Currently only "No spam. Unsubscribe
      anytime." — there is no `/privacy` route yet for it to link to.
- [ ] **Defined retention.** Nothing is retained today, which is not the same as
      having a policy. Decide before the first real lead is collected.
- [x] **Honeypot field** — a `company` field, hidden from sight and from
      assistive tech, rejected by the schema if non-empty. On a hit the action
      returns success rather than an error, so a bot learns nothing.

### Input handling that is already in place

- Every field is re-validated server-side with zod at the action boundary. The
  browser's `type="email"` and `required` are a convenience for the visitor, not
  a guarantee.
- Validation failures return one of two fixed strings and never echo the
  submitted value back into the page.
- The honeypot is never named in an error message — telling a bot which field
  caught it just teaches it to skip that one next time.

---

## 6. Workers AI

Workers AI is bound as `AI` and reachable from any server code. Treat model
output as untrusted.

- **Never** render model output as HTML. Text only.
- **Never** let model output reach a shell, a SQL statement, a redirect target,
  or a fetch URL. Prompt injection via page content or user input is assumed.
- **Never** put a secret in a prompt.
- Any user-facing AI feature needs a per-IP rate limit before launch — inference
  costs money, and an unmetered endpoint is a billing DoS.
- Log prompts only in aggregate, never with PII attached.

---

## 7. Storage

**`site-media` (R2)** — public-facing brand and funnel media.

- Served through the Worker (`src/lib/media.ts`), never by exposing a public
  bucket URL, so access stays revocable and observable.
- Nothing private, personal, or unreleased goes in this bucket. There is no
  per-object access control in front of it.
- Uploads are done by a human via `wrangler r2 object put`. There is no upload
  endpoint, and adding one requires auth + type/size validation + a virus
  consideration first.

**`site-isr-cache` (R2)** — OpenNext rendered-page cache.

- Machine-managed. Never write to it by hand.
- It caches **rendered output**. If a page ever renders per-user content, it must
  be excluded from ISR — otherwise one visitor's data is served to the next.

**`.d1-dumps/`** — git-ignored, and must stay that way. A remote dump is
production data sitting on a laptop; delete it when you are done with it.

---

## 8. Dependencies

- Exact versions only (`save-exact=true` in `.npmrc`). A caret is an unreviewed
  future change to code that runs in production.
- `npm audit` runs in CI; a high or critical finding blocks the build.
- Install scripts are **not** auto-approved (npm ≥ 11). Approved packages are
  listed in `allowScripts` in `package.json`. Adding one is a deliberate act —
  read what the script does first.
- Before adding any dependency, apply the checklist in `CLAUDE.md` §4.3.
- No client-side script from a third-party CDN. Self-host it or do without;
  a `<script src>` to someone else's domain is a standing supply-chain risk and
  will break the future CSP.

---

## 9. Deployment and access

- **Nothing deploys automatically today.** `main` is not connected to Cloudflare;
  that happens at launch. Until then the only deploy path is `npm run deploy`
  from a machine already logged in with `wrangler login`.
- When it is connected, deploys run through **Cloudflare Workers Builds** from
  the connected repository. There are no Cloudflare credentials in the repo or in
  GitHub secrets, which removes the single most commonly leaked token.
- Any API token created later must be **scoped to the minimum** (Workers Scripts:
  Edit for the one account) and never account-global.
- Cloudflare dashboard access requires 2FA on every account with write access.
- `main` will deploy to production. Non-`main` branches produce preview versions
  and must never be granted production bindings.
- Note that `dev` already binds the **real** `site-media` and `site-isr-cache`
  buckets, and Workers AI has no local simulation at all — a local `npm run dev`
  can spend real money and write real objects. Not a hypothetical.
- Production logs: `npm run cf:tail`. Treat log output as potentially containing
  visitor IPs — do not paste it into a public channel.

---

## 10. Open items

Tracked here so they are visible rather than forgotten. None of these are done.

- [ ] Content-Security-Policy (§3) — **blocks custom-domain launch**
- [ ] **Artwork provenance** — `public/assets/figure.svg` is traced from another
      studio's artwork on the owner's instruction (`docs/adr/0004`). Licence it,
      re-trace from an image we own, or drop it before the site is public. This
      is a legal exposure, not a security one, but it blocks the same launch.
- [ ] Lead endpoint hardening (§5) — **blocks the funnel form shipping.**
      Honeypot and PII-free logging are done; Turnstile, rate limiting, consent
      copy + privacy policy, and a retention decision are not. The form is live
      in the page but its action stores and sends nothing.
- [ ] Privacy policy and cookie/consent handling, before any analytics loads
- [ ] Decide analytics: Cloudflare Web Analytics (no cookies, no consent banner
      required) vs anything third-party (needs consent + CSP allowance)
- [ ] Data retention policy for leads
- [ ] `security.txt` at `/.well-known/security.txt`
- [ ] Dependency review cadence — who runs `npm audit` and when
