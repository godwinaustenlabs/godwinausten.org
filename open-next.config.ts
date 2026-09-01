import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";

/**
 * OpenNext adapter configuration.
 *
 * incrementalCache: rendered ISR pages land in the `site-isr-cache` R2 bucket
 * (binding NEXT_INC_CACHE_R2_BUCKET), fronted by a regional Cache API layer so
 * repeat reads in the same colo don't hit R2.
 *
 * Not enabled yet (needs resources we haven't provisioned — see
 * docs/cloudflare-resources.md before turning either on):
 *   - tagCache: requires D1 or a sharded Durable Object.
 *   - queue:    requires the DOQueueHandler Durable Object.
 * Without a tagCache, `revalidateTag()` / `revalidatePath()` are no-ops.
 *
 * Docs: https://opennext.js.org/cloudflare/caching
 */
export default defineCloudflareConfig({
  incrementalCache: withRegionalCache(r2IncrementalCache, {
    mode: "long-lived",
    shouldLazilyUpdateOnCacheHit: true,
  }),
});
