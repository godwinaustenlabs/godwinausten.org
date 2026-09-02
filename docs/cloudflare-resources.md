# Cloudflare resource registry

**The single source of truth for every Cloudflare resource this project owns.**

`npm run check:resources` fails CI if a binding in `wrangler.jsonc` has no row
here, or a row here has no binding. That check is why this file cannot drift.

Account: **Godwin Austen Labs** (`ec758d282b2c89b4a1a147b64f445849`)

---

## Rules

1. Ask the owner for the name **before** creating anything.
2. Create it with the wrangler CLI. Never the dashboard.
3. Add the row here in the same change that adds the binding.
4. Run `npm run cf:typegen` so TypeScript sees the new binding.

---

## Active bindings

| Binding                    | Type                  | Resource            | Created      | Purpose                                                                                                                              |
| -------------------------- | --------------------- | ------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `ASSETS`                   | Workers static assets | `.open-next/assets` | build output | Static files emitted by the OpenNext build. Managed by the adapter.                                                                  |
| `WORKER_SELF_REFERENCE`    | Service               | `site`              | 2026-08-31   | Required by OpenNext for ISR revalidation and cache purge. Must equal the worker name.                                               |
| `MEDIA`                    | R2 bucket             | `site-media`        | 2026-08-31   | Brand and funnel media: VSL video, case-study imagery, downloadables. Reachable only through the allowlist in `src/server/media.ts`. |
| `NEXT_INC_CACHE_R2_BUCKET` | R2 bucket             | `site-isr-cache`    | 2026-08-31   | OpenNext incremental (ISR) cache. Machine-managed — never write by hand. Binding name is fixed by OpenNext.                          |
| `AI`                       | Workers AI            | —                   | 2026-08-31   | Workers AI inference. No resource to provision; binding only.                                                                        |
| `IMAGES`                   | Cloudflare Images     | —                   | 2026-08-31   | Image transformation binding. No resource to provision.                                                                              |

## Workers

| Name   | Environment | URL                            | Notes                                             |
| ------ | ----------- | ------------------------------ | ------------------------------------------------- |
| `site` | production  | `site.<subdomain>.workers.dev` | `workers_dev: true`. Custom domain not wired yet. |

## Deliberately not provisioned

| Product                     | Why not                                                | What would change our mind                                            |
| --------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------- |
| D1                          | No persistent state yet. See `docs/data-layer.md`.     | Relational data with real queries and joins.                          |
| Durable Objects             | Same.                                                  | Per-entity coordination, sessions, or a sharded ISR tag cache.        |
| KV                          | Nothing needs eventually-consistent global config yet. | Feature flags or A/B funnel variants read on every request.           |
| Queues                      | No async work.                                         | Lead delivery to a CRM, or webhook fan-out that must survive failure. |
| Custom domain / zone routes | Site is not presentable yet.                           | Launch. Requires the CSP in `SECURITY.md` §3 first.                   |
| Turnstile                   | The form does not exist yet.                           | The lead-capture form. Required before it ships — `SECURITY.md` §5.   |
| Rate limiting               | No public write endpoint yet.                          | Same as above.                                                        |

---

## Provisioning cookbook

Run these **only after the owner has given a name.**

```bash
# R2 bucket
npx wrangler r2 bucket create <name>

# KV namespace
npx wrangler kv namespace create <BINDING_NAME>

# D1 database   (read docs/data-layer.md first — this is a decision, not a task)
npx wrangler d1 create <name>

# Queue
npx wrangler queues create <name>

# Secret (production)
npx wrangler secret put <NAME> --name site
```

After any of the above:

```bash
# 1. add the binding to wrangler.jsonc
# 2. add a row to this file
npm run check:resources   # must pass
npm run cf:typegen        # regenerate cloudflare-env.d.ts
```

## Audit commands

```bash
npm run cf:whoami                 # which account am I on
npx wrangler r2 bucket list       # every bucket on the account
npx wrangler kv namespace list
npx wrangler d1 list
npm run cf:secrets                # secret names bound to `site` (not values)
npm run cf:versions               # deployed versions of `site`
```
