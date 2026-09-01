import { z } from "zod";

/**
 * Public, build-time environment. Anything here is inlined into client bundles,
 * so it must never hold a secret.
 *
 * Server secrets are NOT read here — they live in the Worker `env` via
 * `getCloudflareContext().env` (see src/lib/cloudflare.ts) and are set with
 * `npx wrangler secret put`. See SECURITY.md.
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
});

export const publicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
