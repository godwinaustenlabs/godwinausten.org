# 0009 — The Rembrandt reel ships in the repository

**Date:** 2026-09-27
**Status:** accepted — narrows [0007](0007-media-on-a-public-origin.md) for one
asset, and for nothing else

## Context

The owner reported a delay between hovering a reel and seeing it move, and asked
for the file to be served "here in directory" instead of streamed from R2.

The delay was real. Three things caused it, and the host was the smallest:

- **The encode.** What sat at `reels/rembrandt.mp4` was 1920×1080 at 60fps and
  7.5 Mbps **with an audio track** — 16 MB for a sixteen-second loop that every
  consumer renders `muted`, in a card a few hundred pixels wide. (Note that
  `src/server/media.ts` described it as 5.5 MB; that was stale.)
- **The preload.** `Reel` carried `preload="none"`, so the pointer arriving was
  the moment the _download started_. The wait was a cold fetch of the whole file
  with somebody watching a still.
- **The host**, which changed least of all.

## Decision

Re-encode it, warm it before it is needed, and commit it.

- **720p30, no audio, CRF 24, `+faststart`** → 1.9 MB, an eight-fold reduction
  with no visible loss at the size it is ever displayed. Audio is dropped
  outright because every consumer sets `muted`; shipping a track nobody can hear
  is pure weight.
- **`Reel` warms on approach.** One `IntersectionObserver` with a viewport of
  `rootMargin` flips `preload` to `"auto"`; a second, tighter one plays. A reel
  nobody scrolls near still costs nothing, which is the property `preload="none"`
  was protecting.
- **The file lives at `public/assets/reels/rembrandt.mp4`,** and
  `MEDIA_ASSETS["reel-picasso"].local` makes `mediaSrc()` prefer it over the
  bucket.

**This does not reopen 0007.** That ADR is about keeping the _Worker_ out of the
byte path — every `Range` request was a full OpenNext invocation plus two R2
operations, and that is what ran the Worker out of resources. Workers Assets
serves from the same Cloudflare edge and invokes the Worker exactly as often: not
at all. The VSL and the playbook are untouched and still resolve through the
origin.

## Consequences

**Easier.** Hover-to-play is instant, because by the time a pointer can reach the
frame the file is buffered — measured at `readyState: 4` before any hover. One
fewer origin in the critical path, and a reel that cannot 404 because a bucket
key was emptied.

**Harder.** 1.9 MB of binary in git, and in every deploy upload. Swapping the cut
is now a commit rather than a bucket upload — which loses the "replace it with no
deploy" property that `MEDIA_ASSETS` exists to give. That trade was the owner's
call and is worth re-making if the reel starts changing often.

**Reversible in one line.** `key` is still the bucket's. Delete `local` and the
asset goes back to streaming from R2 with nothing else to change.

## Alternatives

- **Keep it on R2 and only fix the preload.** This would have removed most of the
  latency on its own and cost nothing in repo weight — it is what I would have
  done unprompted. Rejected because the owner asked for the file locally, and the
  combination is genuinely faster than either half.
- **Re-encode but leave it in the bucket.** Same speed, no repo weight, and it
  keeps deploy-free swapping. The honest runner-up.
- **`preload="auto"` everywhere.** Removes the delay and makes every visitor pull
  the reel whether or not they scroll to it — on the funnel's landing page, that
  is a megabyte spent on people who never see the section.
