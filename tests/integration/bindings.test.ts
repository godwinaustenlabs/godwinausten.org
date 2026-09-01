import { env } from "cloudflare:workers";
import { describe, expect, it } from "vitest";

/**
 * These run inside workerd against local Miniflare simulations of the real
 * bindings. They prove wrangler.jsonc is wired correctly — a rename in the
 * config fails here rather than in production.
 */
describe("worker bindings", () => {
  it("exposes the media R2 bucket", () => {
    expect(env.MEDIA).toBeDefined();
  });

  it("exposes the OpenNext incremental cache bucket", () => {
    expect(env.NEXT_INC_CACHE_R2_BUCKET).toBeDefined();
  });

  it("round-trips an object through R2", async () => {
    await env.MEDIA.put("test/hello.txt", "hello");
    const object = await env.MEDIA.get("test/hello.txt");
    expect(await object?.text()).toBe("hello");
  });

  it("returns null for a missing key", async () => {
    expect(await env.MEDIA.get("test/does-not-exist")).toBeNull();
  });
});
