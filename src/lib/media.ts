import { mediaBucket } from "./cloudflare";

/**
 * Read an object from the `site-media` R2 bucket and hand it back as a
 * streaming Response with the right caching headers.
 *
 * Used by route handlers that serve the VSL video and other large assets, so
 * media never has to sit in the repo or in the Workers assets bundle.
 */
export async function serveMedia(
  key: string,
  { immutable = true }: { immutable?: boolean } = {},
): Promise<Response> {
  const object = await mediaBucket().get(key);
  if (!object) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set(
    "cache-control",
    immutable ? "public, max-age=31536000, immutable" : "public, max-age=3600",
  );

  return new Response(object.body, { headers });
}
