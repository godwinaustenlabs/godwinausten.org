import { mediaBucket } from "@/lib/cloudflare";

/**
 * The public origin `site-media` is served from.
 *
 * ## Why a hostname and not the Worker
 *
 * Everything here used to reach the browser through `/api/media/[id]`, and for
 * the PDF that is still the right answer. For video it was the wrong one, badly
 * enough to take the Worker down.
 *
 * A `<video>` does not fetch a file. It opens a chain of `Range` requests and
 * keeps opening them as it buffers and as the reader scrubs, and this site puts
 * several players on a page — `/work` renders one `Reel` per experience, the
 * home panel has a `Reel` and a `FilmFrame`, and `FilmFrame`'s theatre is
 * `preload="auto"`. Every one of those requests was a full OpenNext render
 * invocation plus an `R2.head()` and an `R2.get()`, and on `*.workers.dev`
 * Cloudflare's CDN does not cache, so no two visitors ever shared the work.
 * Multiply it out and the Worker runs out of resources before the funnel has
 * served anyone.
 *
 * Bound to a custom domain, R2 answers `Range` itself and sits behind the CDN,
 * so a reel costs the Worker nothing at all — not an invocation, and on a cache
 * hit not an R2 operation either. See `docs/adr/0007-media-on-a-public-origin.md`
 * for what that trades away.
 *
 * ## Why a constant and not only an env var
 *
 * These pages are statically prerendered, so `mediaSrc()` runs at build time,
 * where `wrangler.jsonc`'s `vars` do not exist. A URL that is only correct at
 * runtime would be baked wrong. The host is a public, stable fact about the
 * deployment — the same kind of fact as the bucket keys below — so it is
 * written here, next to them.
 *
 * `NEXT_PUBLIC_MEDIA_BASE_URL` overrides it for a preview or a local run, and
 * setting that to an empty string turns the origin off entirely and sends
 * everything back through `/api/media/[id]`. That is the escape hatch if the
 * domain ever has to be pulled: one variable, no deploy of new code.
 */
const MEDIA_ORIGIN = "https://cdn.godwinausten.org";

/**
 * The origin in force, or `null` when media should go through the Worker.
 *
 * `undefined` means "nobody said otherwise" and yields the constant. The empty
 * string is the off switch, and is distinguishable from `undefined` on purpose.
 */
function mediaOrigin(): string | null {
  const override = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
  const origin = override === undefined ? MEDIA_ORIGIN : override;
  return origin ? origin.replace(/\/+$/, "") : null;
}

/**
 * The funnel's media, and the only keys the app will ever read from R2.
 *
 * ## Why an allowlist, now that the bucket is reachable anyway
 *
 * This table used to be an access control. It is not one any more: with
 * `site-media` on a public origin, every object in it is fetchable by anyone
 * who knows its key, and no code here can change that. The rule that follows
 * from it is in `SECURITY.md` §7 and is now the only thing holding the line —
 * **nothing goes in this bucket that is not already public.**
 *
 * What the table is still for is the thing it was always better at: a single
 * place that says what the site serves. A key appears once, the pages ask for
 * an *id*, and swapping the file the funnel plays is one line here rather than
 * a hunt through three pages. It also keeps `/api/media/[id]` — still the path
 * for the download, and the fallback for everything if the origin is turned off
 * — free of any request-supplied string, so there is no traversal to defend.
 *
 * ## Replacing an asset
 *
 * Upload to the key named here and the site picks it up on the next request —
 * no deploy, no code change. That is the whole point of the indirection: the
 * owner swaps the real film or the real PDF into the bucket and the page starts
 * serving it.
 *
 * Until then `fallback` (a file shipped in `public/`) stands in, so the flow
 * works end to end today rather than 404ing at the last step. An asset with no
 * fallback simply reports itself absent, and the block renders its placeholder.
 */
export const MEDIA_ASSETS = {
  playbook: {
    key: "playbook/what-to-automate-first.pdf",
    contentType: "application/pdf",
    /** Sent as a download under this name, not opened in a tab. */
    filename: "what-to-automate-first.pdf",
    fallback: "/assets/playbook-placeholder.pdf",
  },
  vsl: {
    key: "vsl/main.mp4",
    contentType: "video/mp4",
    filename: null,
    /**
     * A generated stand-in, not stock footage — `npm run gen:placeholder-video`
     * draws it here (docs/adr/0005). It exists so `FilmFrame`'s transport is
     * live before the real cut is uploaded: without a `src` every control is
     * disabled, which made the one control-heavy component on the funnel
     * impossible to use or test.
     */
    fallback: "/assets/film-placeholder.mp4",
  },
  "reel-picasso": {
    key: "reels/rembrandt.mp4",
    contentType: "video/mp4",
    filename: null,
    /**
     * Its own stand-in, not the VSL's.
     *
     * A file per asset is what makes the `fallback` column useful: the owner
     * drops a real cut over this one and only the case-study reel changes.
     * Sharing one file between the two slots saved 300 KB and meant replacing
     * the reel silently replaced the film as well.
     *
     * **The object exists.** The Faayy walkthrough is live at the key above, so
     * this stand-in is now only what a deleted object falls back to. What
     * reaches the browser is a 5.5 MB faststart MP4 — see `media/README.md` for
     * the master and the encode. Two things about that are load-bearing, and a
     * replacement that ignores either will look fine locally and stall in
     * production:
     *
     * - **`moov` before `mdat`** (`-movflags +faststart`). The owner's master
     *   is a screen recording with its index at the tail, which a player cannot
     *   reach without pulling the whole file first — three pages would hold on
     *   a black rectangle until 27 MB landed.
     * - **`isom`/`avc1` brand, not `qt  `.** Safari plays a QuickTime-branded
     *   file; Chrome and Firefox are unreliable with one, and `contentType`
     *   here says `video/mp4` either way, so the mislabel is invisible until
     *   someone opens the site in the wrong browser.
     *
     * Size is not a page-weight question — every consumer is `Reel`, which is
     * `preload="none"` and starts the fetch from an `IntersectionObserver` —
     * but it is still time-to-first-frame once the reel scrolls into view.
     */
    fallback: "/assets/reel-placeholder.mp4",
  },
} as const;

export type MediaId = keyof typeof MEDIA_ASSETS;

export function isMediaId(value: string): value is MediaId {
  return Object.hasOwn(MEDIA_ASSETS, value);
}

/**
 * The Worker's URL for an asset. Always this shape; never a bucket key.
 *
 * Still the right answer for the playbook: a download needs
 * `Content-Disposition`, which is a header the origin would have to carry as
 * object metadata, and one PDF per captured lead is a request volume the Worker
 * will never notice. It is the volume that was the problem, not the route.
 */
export function mediaHref(id: MediaId, options: { download?: boolean } = {}): string {
  return `/api/media/${id}${options.download ? "?download=1" : ""}`;
}

/**
 * The origin's URL for an asset, or `null` when there is no origin configured.
 *
 * No `head()` behind it, deliberately — see `mediaSrc`.
 */
export function mediaObjectUrl(id: MediaId): string | null {
  const origin = mediaOrigin();
  return origin ? `${origin}/${MEDIA_ASSETS[id].key}` : null;
}

/**
 * Whether the bucket actually holds this asset.
 *
 * `head` rather than `get`: the answer is one metadata lookup, and a render that
 * only needs to decide between a `<video>` and a placeholder has no business
 * pulling the body.
 *
 * Never throws. A binding that is missing or unhappy means "no film yet", which
 * is a placeholder — not a 500 on the home page.
 */
export async function hasMedia(id: MediaId): Promise<boolean> {
  try {
    return (await mediaBucket().head(MEDIA_ASSETS[id].key)) !== null;
  } catch {
    return false;
  }
}

/**
 * Where a player should point, or `undefined` when there is nothing to point at.
 *
 * The shape blocks want: a `src` prop that is either a URL or absent, so the
 * block itself never has to know that R2 is involved.
 *
 * ## Why this asks R2 nothing
 *
 * It would be natural to `head()` the key here and hand back the stand-in when
 * the object is missing. Two reasons not to, and they compound:
 *
 * - **These pages are static.** A binding read at render either freezes the
 *   answer at build time — so an upload needs a deploy, which is the one thing
 *   the whole indirection exists to avoid — or forces the page dynamic, which
 *   puts the Worker back in the path it was just taken out of.
 * - **A 404 is a better stand-in than a stand-in.** `Reel` and `FilmFrame` fall
 *   back to `PlaceholderReel` — the drawn loop — when a `src` fails to load,
 *   the same branch they already take when there is no `src` at all. A missing
 *   object therefore costs one failed request and shows the drawn loop, rather
 *   than costing a `head()` on every render plus a real MP4 down the wire.
 *
 * So the answer is a string, computed, and correct whether or not anything has
 * been uploaded yet.
 *
 * With no origin configured this degrades to exactly what it did before — the
 * Worker route, resolving object-then-fallback per request.
 */
export async function mediaSrc(id: MediaId): Promise<string | undefined> {
  const url = mediaObjectUrl(id);
  if (url) return url;
  if (MEDIA_ASSETS[id].fallback) return mediaHref(id);
  return (await hasMedia(id)) ? mediaHref(id) : undefined;
}

/**
 * Parse a single-range `Range` header against a known size.
 *
 * Returns `null` for "no range, send everything" and the string
 * `"unsatisfiable"` for a range that cannot be served — which is a 416, not a
 * silent full-body 200, because a player that asked for byte 10^9 needs to be
 * told rather than handed the start of the file again.
 *
 * Multi-range (`bytes=0-99,200-299`) is deliberately unsupported: it requires a
 * multipart response, no browser media element asks for one, and pretending to
 * support it is worse than ignoring it.
 */
export function parseRange(
  header: string | null,
  size: number,
): { start: number; end: number; length: number } | null | "unsatisfiable" {
  if (!header) return null;

  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match) return null;

  const [, rawStart, rawEnd] = match;
  if (rawStart === "" && rawEnd === "") return null;

  let start: number;
  let end: number;

  if (rawStart === "") {
    // `bytes=-500` — the *last* 500 bytes. Players use this to read the moov
    // atom at the tail of an unfaststarted MP4.
    const suffix = Number(rawEnd);
    if (suffix <= 0) return "unsatisfiable";
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(rawStart);
    end = rawEnd === "" ? size - 1 : Math.min(Number(rawEnd), size - 1);
  }

  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= size) {
    return "unsatisfiable";
  }
  return { start, end, length: end - start + 1 };
}
