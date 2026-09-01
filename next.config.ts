import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Fail the build on type errors. Never flip this to `true` to make a deploy go
  // through — fix the code instead (see CLAUDE.md). Linting is a separate step
  // (`npm run lint`); Next 16 removed `next lint` and the `eslint` config key.
  typescript: { ignoreBuildErrors: false },

  // Trim the response surface.
  poweredByHeader: false,

  // `next dev` otherwise appends a "This is NOT the Next.js you know" block to
  // CLAUDE.md on every run. CLAUDE.md is the owner's hard-constraints file
  // (CLAUDE.md §preamble) and nothing should be writing to it automatically;
  // the Next 16 guidance it adds is already covered by §1 and §2.6.
  agentRules: false,

  /**
   * Security headers.
   *
   * Set here rather than in a `proxy.ts` (Next 16's renamed middleware) on
   * purpose: proxy is Node-runtime-only, and OpenNext flags Node middleware as
   * experimental and unmaintained on Cloudflare. `headers()` is part of the
   * routing manifest, costs nothing per request, and is all these need.
   *
   * Static assets get their headers from public/_headers instead — Workers
   * Assets serves those without invoking the Worker.
   *
   * See SECURITY.md §3. A Content-Security-Policy is deliberately absent and is
   * tracked there as required before the custom domain goes live.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "x-content-type-options", value: "nosniff" },
          { key: "referrer-policy", value: "strict-origin-when-cross-origin" },
          { key: "x-frame-options", value: "DENY" },
          {
            key: "permissions-policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          { key: "cross-origin-opener-policy", value: "same-origin" },
          // Ignored by browsers over plain HTTP, so it is safe to send always.
          {
            key: "strict-transport-security",
            value: "max-age=63072000; includeSubDomains",
          },
        ],
      },
    ];
  },

  images: {
    // Cloudflare Images / R2-backed remote sources go here as we add them.
    remotePatterns: [],
  },

  experimental: {
    // Server Actions are the only mutation path in this app (see CLAUDE.md).
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;

// Makes Cloudflare bindings (MEDIA, AI, IMAGES, ...) available to
// `getCloudflareContext()` during `next dev`, backed by local Miniflare
// simulations persisted in .wrangler/state.
initOpenNextCloudflareForDev({
  // Gate for `npm run dev:remote`. Remote bindings additionally require the
  // individual binding to carry `"experimental_remote": true` in wrangler.jsonc
  // — this flag alone does not send anything to the live account.
  remoteBindings: process.env.REMOTE_BINDINGS === "1",
});
