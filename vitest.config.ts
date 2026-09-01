import { defineConfig } from "vitest/config";
import { cloudflareTest } from "@cloudflare/vitest-pool-workers";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const alias = {
  "@": fileURLToPath(new URL("./src", import.meta.url)),
  "@tests": fileURLToPath(new URL("./tests", import.meta.url)),
};

/**
 * Two test projects, because this app runs in two runtimes:
 *
 *  - `unit`   — jsdom. Pure logic and React components (blocks, composition
 *               helpers, class builders). Fast, no Cloudflare.
 *  - `worker` — the real workerd runtime via Miniflare, configured straight from
 *               wrangler.jsonc. Anything touching a binding (R2, AI, Images) or
 *               Worker request handling. This is the only place binding
 *               behaviour can be trusted.
 *
 * End-to-end lives separately in Playwright (playwright.config.ts).
 */
export default defineConfig({
  test: {
    projects: [
      {
        plugins: [react()],
        resolve: { alias },
        test: {
          name: "unit",
          environment: "jsdom",
          globals: true,
          setupFiles: ["./tests/setup/unit.setup.ts"],
          include: ["tests/unit/**/*.test.{ts,tsx}"],
        },
      },
      {
        plugins: [
          cloudflareTest({
            // Bindings come from the real config, so a rename there fails a test
            // here rather than in production.
            wrangler: { configPath: "./wrangler.jsonc" },
            // Never reach the live account from a test run.
            remoteBindings: false,
            // Override wrangler.jsonc's `main` (.open-next/worker.js) so tests do
            // not require a full OpenNext build. See tests/setup/worker-entry.ts.
            main: "./tests/setup/worker-entry.ts",
          }),
        ],
        resolve: { alias },
        test: {
          name: "worker",
          include: ["tests/integration/**/*.test.ts"],
          setupFiles: ["./tests/setup/worker.setup.ts"],
        },
      },
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.d.ts", "src/app/**/layout.tsx", "src/types/**"],
    },
  },
});
