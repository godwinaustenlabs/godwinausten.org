import { mediaBucket } from "@/lib/cloudflare";
import { MEDIA_ASSETS, isMediaId, parseRange, type MediaId } from "@/server/media";

export const dynamic = "force-dynamic";

/**
 * Streams one allowlisted object out of the `site-media` bucket.
 *
 * `[id]` is an id from `MEDIA_ASSETS`, never a bucket key — see the note there
 * for why the obvious `[...key]` version is not what this is.
 *
 * ## What still comes through here
 *
 * The playbook, and nothing else in production. Film and reels now point
 * straight at the public origin, because serving them from here is what
 * exhausted the Worker — the reasoning is in `src/server/media.ts` and
 * `docs/adr/0007-media-on-a-public-origin.md`.
 *
 * This is not dead code, and the range handling below is not vestigial. It is
 * the path every asset takes when `NEXT_PUBLIC_MEDIA_BASE_URL` is empty: a
 * local run, a preview, and the site itself if the origin ever has to be pulled.
 * It must keep working, and `npm run test:worker` is what says it does.
 *
 * ## Range requests
 *
 * A `<video>` element does not download a file and play it; it asks for byte
 * ranges and expects `206 Partial Content` back. A server that ignores `Range`
 * and always returns `200` with the whole body still *plays* — which is why
 * this is easy to ship broken — but the scrubber cannot seek, because the
 * browser has no way to fetch the middle of the file. So the range path here is
 * the feature, not an optimisation.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  if (!isMediaId(id)) return new Response("Not found", { status: 404 });

  const asset = MEDIA_ASSETS[id];
  const wantsDownload = new URL(request.url).searchParams.has("download");

  let object: R2ObjectBody | null = null;
  let head: R2Object | null = null;
  try {
    head = await mediaBucket().head(asset.key);
  } catch {
    head = null;
  }

  // Nothing in the bucket yet. Hand over the shipped stand-in where there is
  // one, so the funnel works before the owner has uploaded anything.
  if (!head) {
    if (!asset.fallback) return new Response("Not found", { status: 404 });

    // A film's stand-in is *redirected* to, not proxied.
    //
    // This used to proxy every stand-in, and the argument for it was
    // `Content-Disposition` — which a redirect loses, because the static asset
    // server knows nothing about it. That argument only ever applied to the
    // download. For a film it bought nothing and cost a great deal: proxying a
    // stand-in means buffering the whole file with `arrayBuffer()` to slice a
    // range out of it, and a `<video>` asks for ranges by the dozen. One reader
    // scrubbing a placeholder was tens of whole-file allocations, which is a
    // large part of how this route came to exhaust the Worker.
    //
    // `/assets/...` is served by the ASSETS binding, which answers `Range`
    // natively and does not invoke this Worker at all, so the redirect is both
    // cheaper and more correct than the copy it replaces.
    if (!asset.filename) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: new URL(asset.fallback, request.url).toString(),
          // Short: the day an object lands at the key this answer is wrong, and
          // a stale redirect would keep the stand-in on screen past its welcome.
          "Cache-Control": "public, max-age=60",
        },
      });
    }

    // The download still proxies, and still ranges, for the reason the redirect
    // above does not apply to it: the browser must save this under the name in
    // the table rather than open it in a tab. It is one small PDF per captured
    // lead, so the buffer is affordable here in a way it never was for a film.
    const stand = await fetch(new URL(asset.fallback, request.url));
    if (!stand.ok || !stand.body) return new Response("Not found", { status: 404 });

    const body = new Uint8Array(await stand.arrayBuffer());
    const standRange = parseRange(request.headers.get("range"), body.byteLength);
    if (standRange === "unsatisfiable") {
      return new Response(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${body.byteLength}`, "Accept-Ranges": "bytes" },
      });
    }

    const slice = standRange
      ? body.subarray(standRange.start, standRange.start + standRange.length)
      : body;
    const headers = fileHeaders(asset, String(slice.byteLength), wantsDownload);
    if (standRange) {
      headers.set(
        "Content-Range",
        `bytes ${standRange.start}-${standRange.end}/${body.byteLength}`,
      );
    }

    return new Response(slice, { status: standRange ? 206 : 200, headers });
  }

  const range = parseRange(request.headers.get("range"), head.size);
  if (range === "unsatisfiable") {
    return new Response(null, {
      status: 416,
      headers: { "Content-Range": `bytes */${head.size}`, "Accept-Ranges": "bytes" },
    });
  }

  try {
    object = (await mediaBucket().get(
      asset.key,
      range ? { range: { offset: range.start, length: range.length } } : undefined,
    )) as R2ObjectBody | null;
  } catch {
    object = null;
  }
  if (!object?.body) return new Response("Not found", { status: 404 });

  const headers = fileHeaders(asset, String(range ? range.length : head.size), wantsDownload);
  if (head.httpEtag) headers.set("ETag", head.httpEtag);
  if (range) headers.set("Content-Range", `bytes ${range.start}-${range.end}/${head.size}`);

  return new Response(object.body, { status: range ? 206 : 200, headers });
}

/** The headers every response from this route carries, real object or stand-in. */
function fileHeaders(
  asset: (typeof MEDIA_ASSETS)[MediaId],
  length: string | null,
  wantsDownload: boolean,
): Headers {
  const headers = new Headers({
    "Content-Type": asset.contentType,
    "Accept-Ranges": "bytes",
    // Immutable is wrong here: the whole design is that the owner overwrites
    // the key in place. An hour is long enough to be worth caching and short
    // enough that a replacement is live the same morning.
    "Cache-Control": "public, max-age=3600",
    "X-Content-Type-Options": "nosniff",
  });
  if (length) headers.set("Content-Length", length);
  if (wantsDownload && asset.filename) {
    headers.set("Content-Disposition", `attachment; filename="${asset.filename}"`);
  }
  return headers;
}
