import { cf } from "@/lib/cloudflare";

export const dynamic = "force-dynamic";

/**
 * Liveness probe. Confirms the Worker is up and that binding access works,
 * without leaking anything about the environment.
 */
export function GET() {
  const { cf: meta } = cf();

  return Response.json({
    ok: true,
    colo: meta?.colo ?? null,
    time: new Date().toISOString(),
  });
}
