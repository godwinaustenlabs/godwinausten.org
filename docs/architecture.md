# Architecture

## The shape of a request

```
Visitor
  │
  ▼
Cloudflare edge
  │
  ├─▶ static asset?  ──▶  Workers Assets (.open-next/assets)  ──▶  response
  │                        headers from public/_headers
  │
  ▼
Worker `site`  (.open-next/worker.js)
  │
  ├─▶ Next.js App Router       security headers from next.config headers()
  │     ├─ page.tsx builds a PageComposition
  │     └─ ModuleRenderer resolves + validates blocks, renders BlockFrames
  │
  ├─▶ bindings via getCloudflareContext()
  │     ├─ MEDIA   (R2 site-media)      VSL video, imagery
  │     ├─ AI      (Workers AI)         inference
  │     └─ IMAGES  (Cloudflare Images)  transformation
  │
  └─▶ ISR cache
        NEXT_INC_CACHE_R2_BUCKET (R2 site-isr-cache)
        fronted by a regional Cache API layer (withRegionalCache)
```

## Layers

| Layer      | Path              | Responsibility                                                                     |
| ---------- | ----------------- | ---------------------------------------------------------------------------------- |
| Routes     | `src/app/`        | URL → composition. Thin by design.                                                 |
| Modules    | `src/modules/`    | The block system: contract, registry, renderer, composition transforms.            |
| Components | `src/components/` | Cross-block primitives — `ui/`, `motion/`, `layout/`. Not blocks.                  |
| Content    | `src/content/`    | Typed content modules. The current "database".                                     |
| Server     | `src/server/`     | Server Actions, service calls, future `db/`. Never imported by a client component. |
| Lib        | `src/lib/`        | Binding access, env, small pure utilities.                                         |

## Decisions worth knowing

**Server Components by default.** `"use client"` appears in exactly the places
that need browser APIs — today, `BlockFrame` and `CompositionStage`. Blocks stay
server components unless they genuinely need interactivity, which keeps the
funnel's JS payload small.

**Blocks are lazily imported.** `BlockDefinition.load` is a dynamic import
resolved by `ModuleRenderer`, so a page ships only the blocks it places.

**Props are validated at the renderer, not inside blocks.** One boundary, one
error format, and blocks can trust their props.

**`next dev` is not production.** It runs on Node; production runs on `workerd`.
`npm run preview` and `npm run test:worker` are the accurate checks.

**No database.** See `docs/data-layer.md`. Content is code until state exists.

## Caching

| Content              | Mechanism                        | Where                                    |
| -------------------- | -------------------------------- | ---------------------------------------- |
| Static assets        | immutable, 1 year                | `public/_headers`                        |
| Rendered pages (ISR) | OpenNext incremental cache       | R2 `site-isr-cache` + regional Cache API |
| Media                | `cache-control` set per response | `src/lib/media.ts`                       |

On-demand revalidation (`revalidateTag`/`revalidatePath`) is **inactive** — it
needs a tag cache backed by D1 or a sharded Durable Object. Time-based
`revalidate` works. See `docs/data-layer.md`.

## Adding a route

1. Ask first (`CLAUDE.md` §2.3). Route folders exist without `page.tsx` on purpose.
2. Create `src/app/<group>/<route>/page.tsx`.
3. Build a `PageComposition` from registered blocks. No layout markup in the file.
4. Add `generateMetadata` if the route is indexable.
5. Add an e2e test if it is part of the funnel.
