/**
 * Runs inside workerd before each integration test file.
 *
 * Bindings come from wrangler.jsonc, backed by local Miniflare simulations —
 * R2 writes here never touch the real `site-media` bucket.
 */
import { env } from "cloudflare:workers";
import { beforeAll } from "vitest";

beforeAll(() => {
  if (!env.MEDIA) {
    throw new Error(
      "MEDIA binding missing. Check the r2_buckets block in wrangler.jsonc and re-run npm run cf:typegen.",
    );
  }
});
