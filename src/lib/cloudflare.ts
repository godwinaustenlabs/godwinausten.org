import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Typed access to the Worker's bindings.
 *
 * Always go through these helpers rather than calling `getCloudflareContext()`
 * inline — it keeps the set of bindings the app touches greppable, and gives one
 * place to change when a binding is renamed in wrangler.jsonc.
 *
 * Run `npm run cf:typegen` after every wrangler.jsonc binding change.
 */

/** Request-scoped Cloudflare context. Sync form — valid in dynamic renders. */
export function cf() {
  return getCloudflareContext();
}

/** Async form — required in statically generated routes and at build time. */
export async function cfAsync() {
  return getCloudflareContext({ async: true });
}

/** R2: brand + funnel media (bucket `site-media`). */
export function mediaBucket(): R2Bucket {
  return cf().env.MEDIA;
}

/** Workers AI. */
export function ai(): Ai {
  return cf().env.AI;
}

/** Cloudflare Images transformation binding. */
export function images(): ImagesBinding {
  const binding = cf().env.IMAGES;
  if (!binding) {
    throw new Error(
      "IMAGES binding is not available. Check wrangler.jsonc and run npm run cf:typegen.",
    );
  }
  return binding;
}

/** Cloudflare's request metadata (colo, country, tlsVersion, ...). */
export function requestCf() {
  return cf().cf;
}

/** Fire-and-forget work that must not block the response. */
export function waitUntil(promise: Promise<unknown>): void {
  cf().ctx.waitUntil(promise);
}
