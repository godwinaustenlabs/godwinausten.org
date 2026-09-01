import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 8788);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

/**
 * E2E runs against the OpenNext *Worker* preview, not `next dev`.
 *
 * That is deliberate: `next dev` uses the Node runtime, so it cannot catch the
 * class of bug that only appears in workerd (missing Node built-ins, binding
 * access, streaming differences). If it passes here, it passes in production.
 *
 * Set E2E_BASE_URL to point at a deployed preview URL instead.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],

  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    // Chromium-based on purpose: keeps CI to a single browser download.
    // Add a WebKit project (and `playwright install webkit`) when Safari-specific
    // behaviour — sticky positioning, video autoplay — actually needs covering.
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],

  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npx opennextjs-cloudflare build && npx opennextjs-cloudflare preview --port ${PORT}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 240_000,
      },
});
