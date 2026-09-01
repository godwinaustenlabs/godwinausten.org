# 0001 — Security headers in next.config, not proxy.ts

**Date:** 2026-08-31
**Status:** accepted

## Context

Security headers need to be on every response the Worker serves. The obvious
home is Next's request-boundary hook — `middleware.ts`, renamed to `proxy.ts` in
Next 16.

Two things ruled it out during setup:

1. Next 16's `proxy` is **Node-runtime only**. `export const config = { runtime: "edge" }`
   fails the build with "Proxy does not support Edge runtime".
2. OpenNext prints, on every build and every preview boot:
   `Node.js middleware support is experimental in cloudflare, and not officially
maintained by OpenNext maintainers. Use at your own risk.`

Putting the site's security headers on an explicitly unmaintained code path is a
bad trade when the headers are static strings.

## Decision

Security headers are set in the `headers()` block of `next.config.ts`. Static
assets keep their headers in `public/_headers`, which Workers Assets applies
without invoking the Worker at all.

`src/proxy.ts` was written, then deleted.

## Consequences

**Easier:** no experimental runtime in the request path; headers are part of the
routing manifest so they cost nothing per request; one fewer file that can fail
at the edge.

**Harder:** no per-request conditional logic. Concretely, HSTS can no longer be
gated on `request.nextUrl.protocol === "https:"`. It is now sent
unconditionally, which is safe — browsers ignore HSTS over plain HTTP.

**Accepted:** if the funnel later needs genuine per-request work at the network
boundary (geo-routing, A/B assignment by cookie), that requires reopening this
decision and accepting OpenNext's experimental Node middleware. That gets its
own ADR — it is not a change to make quietly.

`tests/e2e/smoke.spec.ts` asserts the headers on a real workerd response, so a
regression from either mechanism fails CI.

## Alternatives

- **`proxy.ts` on the Node runtime** — rejected: unmaintained path on Cloudflare,
  for no capability we currently need.
- **Headers set in each route handler** — rejected: impossible to enforce, and a
  new route silently ships without them.
- **A Cloudflare Transform Rule on the zone** — rejected for now: it lives in the
  dashboard, outside the repo, and cannot be reviewed or tested in CI. Worth
  revisiting only if headers are ever needed in front of non-Worker origins.
