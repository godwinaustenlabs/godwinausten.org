import { mediaBucket } from "@/lib/cloudflare";

/**
 * The funnel's media, and the only keys the app will ever read from R2.
 *
 * ## Why an allowlist and not a path
 *
 * The obvious route is `/api/media/[...key]` streaming whatever key it is
 * handed. That hands the public a read cursor over the whole bucket: every
 * object in `site-media` becomes fetchable by anyone who guesses or enumerates a
 * name, and `..` handling becomes our problem. Here the URL carries an *id* from
 * this table and nothing else, so the set of reachable objects is exactly the
 * set written below, and a new one is a code change with a review attached.
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
    key: "reels/picasso.mp4",
    contentType: "video/mp4",
    filename: null,
    /**
     * The same stand-in the VSL uses. One generated film covers every empty
     * slot: it says across the top of every frame that it is a placeholder, so
     * there is nothing to gain from cutting a second one that says it twice,
     * and a second file is another half-megabyte in the repo.
     */
    fallback: "/assets/film-placeholder.mp4",
  },
} as const;

export type MediaId = keyof typeof MEDIA_ASSETS;

export function isMediaId(value: string): value is MediaId {
  return Object.hasOwn(MEDIA_ASSETS, value);
}

/** The public URL for an asset. Always this shape; never a bucket key. */
export function mediaHref(id: MediaId, options: { download?: boolean } = {}): string {
  return `/api/media/${id}${options.download ? "?download=1" : ""}`;
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
 * `mediaHref` when there is something to play, `undefined` when there is not.
 *
 * The shape blocks want: a `src` prop that is either a URL or absent, so the
 * block itself never has to know that R2 is involved.
 *
 * "Something to play" includes the shipped stand-in, and that is the whole
 * point — the route already resolves object-then-fallback, so an asset with a
 * fallback can never 404 and withholding its `src` only left the player
 * disabled in front of a file it would have served. It also saves the `head`:
 * the answer cannot change the URL, so there is nothing to ask R2.
 */
export async function mediaSrc(id: MediaId): Promise<string | undefined> {
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
