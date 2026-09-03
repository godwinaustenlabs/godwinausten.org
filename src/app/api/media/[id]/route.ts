import { mediaBucket } from "@/lib/cloudflare";
import { MEDIA_ASSETS, isMediaId, parseRange, type MediaId } from "@/server/media";

export const dynamic = "force-dynamic";

/**
 * Streams one allowlisted object out of the `site-media` bucket.
 *
 * `[id]` is an id from `MEDIA_ASSETS`, never a bucket key — see the note there
 * for why the obvious `[...key]` version is not what this is.
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
  //
  // Streamed through this handler rather than redirected to `/assets/...`: a
  // redirect hands the request to the static asset server, which knows nothing
  // about `Content-Disposition`, so the placeholder would open in a tab or save
  // itself under its own filename. Proxying it means the stand-in and the real
  // object are indistinguishable to the browser — same headers, same download,
  // same filename — and the day the bucket is filled nothing observable changes.
  if (!head) {
    if (!asset.fallback) return new Response("Not found", { status: 404 });

    const stand = await fetch(new URL(asset.fallback, request.url));
    if (!stand.ok || !stand.body) return new Response("Not found", { status: 404 });

    /*
     * Buffered, and ranged like the real object.
     *
     * Streaming the body straight through is enough for the PDF and not enough
     * for the film: the stand-in is a fragmented MP4 whose seek index sits in
     * the `mfra` box at the very end, so a player that cannot ask for the tail
     * cannot scrub. Answering `Range` here is what makes the transport work
     * before anything has been uploaded — and it keeps the promise the
     * `Accept-Ranges` header below was already making.
     *
     * The stand-ins are small and shipped in `public/`, so holding one in
     * memory to slice it is cheaper than the alternatives. The real object
     * above is never buffered; R2 ranges it at source.
     */
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
