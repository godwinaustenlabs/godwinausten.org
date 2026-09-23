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

| Binding                    | Type                  | Resource            | Created      | Purpose                                                                                                         |
| -------------------------- | --------------------- | ------------------- | ------------ | --------------------------------------------------------------------------------------------------------------- |
| `ASSETS`                   | Workers static assets | `.open-next/assets` | build output | Static files emitted by the OpenNext build. Managed by the adapter.                                             |
| `WORKER_SELF_REFERENCE`    | Service               | `site`              | 2026-08-31   | Required by OpenNext for ISR revalidation and cache purge. Must equal the worker name.                          |
| `MEDIA`                    | R2 bucket             | `site-media`        | 2026-08-31   | Brand and funnel media: VSL video, case-study imagery, downloadables. **Public** — see the custom domain below. |
| `NEXT_INC_CACHE_R2_BUCKET` | R2 bucket             | `site-isr-cache`    | 2026-08-31   | OpenNext incremental (ISR) cache. Machine-managed — never write by hand. Binding name is fixed by OpenNext.     |
| `AI`                       | Workers AI            | —                   | 2026-08-31   | Workers AI inference. No resource to provision; binding only.                                                   |
| `IMAGES`                   | Cloudflare Images     | —                   | 2026-08-31   | Image transformation binding. No resource to provision.                                                         |

## Public origins

A bucket domain is a bucket-level setting, not a Worker binding, so it does not
appear in `wrangler.jsonc` and `npm run check:resources` cannot see it. It is
recorded here because it is a resource on the account like any other.

| Hostname               | Fronts       | Created    | Purpose                                                                                           |
| ---------------------- | ------------ | ---------- | ------------------------------------------------------------------------------------------------- |
| `cdn.godwinausten.org` | `site-media` | 2026-09-23 | Film and reels, served by R2 behind Cloudflare's CDN so video never invokes the Worker. ADR 0007. |

```bash
npx wrangler r2 bucket domain add site-media   --domain cdn.godwinausten.org --zone-id <godwinausten.org zone id> --min-tls 1.2
npx wrangler r2 bucket domain list site-media   # confirm status: active
```

**This makes every object in `site-media` world-readable by key.** The rule that
follows from it is in `SECURITY.md` §7 and it is the only boundary left: nothing
goes in that bucket that is not already public. The reasoning, and the
alternative that was turned down, are in
[ADR 0007](adr/0007-media-on-a-public-origin.md).

To pull it — `npx wrangler r2 bucket domain remove site-media --domain
cdn.godwinausten.org` — set `NEXT_PUBLIC_MEDIA_BASE_URL` to the empty string in
`wrangler.jsonc` in the same change, or the site loses its films rather than
falling back to the Worker route.

## Workers

| Name   | Environment | URL                            | Notes                                             |
| ------ | ----------- | ------------------------------ | ------------------------------------------------- |
| `site` | production  | `site.<subdomain>.workers.dev` | `workers_dev: true`. Custom domain not wired yet. |

## Deliberately not provisioned

| Product                     | Why not                                                                               | What would change our mind                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| D1                          | No persistent state yet. See `docs/data-layer.md`.                                    | Relational data with real queries and joins.                                                        |
| Durable Objects             | Same.                                                                                 | Per-entity coordination, sessions, or a sharded ISR tag cache.                                      |
| KV                          | Nothing needs eventually-consistent global config yet.                                | Feature flags or A/B funnel variants read on every request.                                         |
| Queues                      | No async work.                                                                        | Lead delivery to a CRM, or webhook fan-out that must survive failure.                               |
| Custom domain / zone routes | Site is not presentable yet. (The _bucket_ has one — see above; the Worker does not.) | Launch. Requires the CSP in `SECURITY.md` §3 first.                                                 |
| Cloudflare Stream           | R2 on a public origin was enough to stop the bleeding.                                | The real VSL cut carrying the funnel, and wanting ABR, signed URLs or per-view analytics. ADR 0007. |
| Turnstile                   | The form does not exist yet.                                                          | The lead-capture form. Required before it ships — `SECURITY.md` §5.                                 |
| Rate limiting               | No public write endpoint yet.                                                         | Same as above.                                                                                      |

---

## Provisioning cookbook

Run these **only after the owner has given a name.**

```bash
# R2 bucket
npx wrangler r2 bucket create <name>

# Public domain for an R2 bucket (read SECURITY.md §7 first — this makes every
# object in the bucket world-readable by key)
npx wrangler r2 bucket domain add <bucket> --domain <hostname> --zone-id <id>

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
