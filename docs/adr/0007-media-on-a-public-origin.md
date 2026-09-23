# 0007 — Media leaves the Worker for a public origin

**Date:** 2026-09-23
**Status:** accepted
**Amends:** `SECURITY.md` §7, which said `site-media` is "served through the
Worker, never by exposing a public bucket URL". That is no longer true, and the
rule that replaces it is below.

## Context

Every byte of film and every byte of every reel reached the browser through
`GET /api/media/[id]`. The Worker ran out of resources.

The arithmetic is not close. A `<video>` does not fetch a file; it opens a chain
of `Range` requests and keeps opening them as it buffers and as the reader
scrubs. This site puts several players on a page — `/work` renders a `Reel` per
experience, `/work/[slug]` another, the home panel has a `Reel` **and** a
`FilmFrame` whose theatre is `preload="auto"`. Each of those requests was:

- a full OpenNext render invocation, because the route is `force-dynamic` and
  there is no thin fetch handler in front of it;
- an `R2.head()` **and** an `R2.get()`, two operations to serve one slice;
- and, whenever the key was empty, a `fetch()` of the whole stand-in followed by
  `arrayBuffer()` to slice a range out of it — an entire file allocated per
  range request. `vsl` has no object, so every VSL request took that path.

None of it was shared between visitors. The site is on `*.workers.dev`, where
Cloudflare's CDN does not cache, so `Cache-Control: max-age=3600` bought browser
caching and nothing else. Every cold reader replayed the whole chain.

So the cost scaled as (players on the page) × (range requests each) × (R2
operations each) × (a full Next.js invocation), against a Worker that also has
to render the site.

## Decision

Take the Worker out of the byte path. `site-media` is bound to a public custom
domain, **`cdn.godwinausten.org`**, and `mediaSrc()` returns an origin URL.

R2 answers `Range` itself and, on a custom domain, sits behind Cloudflare's CDN.
A reel now costs the Worker nothing: not an invocation, and on a cache hit not
an R2 operation either. The second reader in a colo pays nothing at all.

**The playbook stays on the Worker.** A download needs `Content-Disposition`,
which the origin would have to carry as object metadata, and it is one PDF per
captured lead — a volume the Worker will never notice. It was the volume that
was the problem, not the route.

**Nothing asks R2 whether the object is there.** `mediaSrc()` used to resolve
object-then-fallback per request, inside the route. Moving that question to
render time would either freeze the answer at build — these pages are static, so
an upload would need a deploy, which is the one thing the indirection exists to
avoid — or force the pages dynamic, putting the Worker back in the path it was
just taken out of. So the question is not asked. A missing object surfaces as a
failed request in the browser, and `Reel` and `FilmFrame` answer it with
`PlaceholderReel`, the same drawn loop they already showed when there was no
`src` at all. That is a better stand-in than the stand-in: it costs one failed
request instead of a real MP4 down the wire.

## What this gives up

**The allowlist is no longer an access control.** With the bucket on a public
origin, every object in `site-media` is fetchable by anyone who knows its key.
`MEDIA_ASSETS` still earns its place — one table saying what the site serves,
and no request-supplied string ever reaching `MEDIA.get()` — but it no longer
decides what is _reachable_.

The rule that replaces the old one, and the only thing now holding the line:

> **Nothing goes in `site-media` that is not already public.** Anything private,
> personal, or unreleased needs a different bucket, and that bucket must not be
> given a domain.

This was put to the owner with a second bucket as the alternative — `site-media`
kept private, a separate public one holding only what the site serves. The owner
chose the single bucket: everything in it today is marketing collateral we are
trying to hand out, and a second bucket is a second upload path to get wrong.
The cost of that choice is that the rule above is now a discipline rather than a
mechanism.

## Alternatives considered

**Cloudflare Stream.** The right long-term answer for a VSL — adaptive bitrate,
signed URLs, per-view analytics, thumbnails — and it would solve this completely.
Rejected for now on cost (per minute stored _and_ delivered) and on change size:
`Reel` and `FilmFrame` would need an HLS player or the Stream embed, which is
bundle weight on a conversion-critical funnel. Worth reopening when the real cut
lands and the VSL is carrying the funnel.

**Fixing the route and keeping it in the path.** Drop the double R2 operation,
add a Cache API layer, stop buffering stand-ins. Several-fold cheaper, and the
stand-in fix was worth doing on its own merits (it is in this change). But the
Worker stays in the byte path and `workers.dev` still will not edge-cache, so it
buys time rather than solving the problem.

**`r2.dev`.** No zone needed, but Cloudflare does not cache it, rate-limits it,
and documents it as development-only. It would have moved the problem rather
than fixed it.

## Consequences

- `cdn.godwinausten.org` must exist before a deploy carrying this change. Until
  the domain is bound, films 404 and every page shows `PlaceholderReel` — which
  is a soft failure, but a visible one.
- The kill switch is `NEXT_PUBLIC_MEDIA_BASE_URL=""`, which sends every asset
  back through `/api/media/[id]`. No code change, no rebuild of the routing.
  This is why the route's range handling is not dead code and must keep passing
  its tests.
- A CSP, when it is written (`SECURITY.md` §3), needs `media-src` to name the
  origin. It is the first host this site loads a subresource from.
- Cache lifetime at the origin is R2's, not ours. Replacing a file in place no
  longer goes live "the same morning" by virtue of a one-hour `max-age` we
  control — it is an edge purge or a new key. See `media/README.md`.
