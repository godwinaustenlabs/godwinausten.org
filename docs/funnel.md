# The VSL funnel

Working notes for the conversion path — the shape we are building toward, kept in
the repo so implementation decisions have something to check themselves against.

**Built so far:** section 04 of the home page (`vsl-optin`) — the video panel and
the inline lead-magnet opt-in. The video is a placeholder; the form validates and
logs but stores nothing. See `SECURITY.md` §5 for exactly what is and is not
cleared.

**Not built:** the multi-step composition swap below, and everything downstream
of the opt-in.

## The path

```
Landing (/)  ──▶  VSL watched  ──▶  CTA  ──▶  Booking / lead form  ──▶  Confirmation
```

The landing page and the funnel are the **same route**. Steps are compositions
swapped through `CompositionStage`, not navigations — see `docs/modules.md`. That
keeps the video, the scroll position, and the analytics session alive across the
step change, which is the whole reason for the module system's transition support.

## Constraints

- **The video is the page.** Time-to-first-frame is the metric that matters.
  Everything else defers to it.
- The VSL is served from R2 (`site-media`) through the Worker, not committed to
  the repo and not bundled into Workers Assets.
- The CTA must be reachable without watching to the end. Blocking it converts
  worse and annoys people who already decided.
- No layout shift once the video is in view. Reserve its box.
- Every step change is an analytics event with a stable step id.

## Variants

A/B variants are composition transforms, not forked pages:

```ts
const variantB = reorder(without(home, "proof"), ["hero", "cta"]);
```

This is deliberate — a variant is data, so it is diffable, unit-testable, and
cannot drift from the control the way a forked page would.

## Before the form ships

The lead-capture endpoint has hard requirements: Turnstile verified server-side,
rate limiting, no PII in logs, consent copy, a real privacy policy, and a defined
retention period. Full list in `SECURITY.md` §5. Shipping without them is a
security regression, not an MVP.

The honeypot and the PII-free logging are done. Turnstile, rate limiting, the
consent copy and privacy policy, and the retention decision are not — which is
why the action's `deliver()` is a log line rather than a destination. Wiring it
to anything real means clearing that list first.

## Open questions

- [ ] Where do leads go — email, CRM, or storage? (Decides whether we need a
      Queue and/or D1.) **This is the blocking one:** everything else in
      `SECURITY.md` §5 can be built, but `deliver()` cannot be finished without
      an answer.
- [ ] Self-hosted video vs Cloudflare Stream. Stream costs money but handles
      adaptive bitrate, which matters on mobile.
- [ ] Analytics: Cloudflare Web Analytics (cookieless, no consent banner) vs
      something third-party (needs consent + a CSP allowance).
- [ ] Does the CTA book directly, or capture an email first?
