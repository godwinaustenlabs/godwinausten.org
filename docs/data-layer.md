# Data layer

**Status: nothing is provisioned. This is a decision, not an oversight.**

The site is content-driven. Content lives in `src/content/` as typed TypeScript
modules — type-checked, diffable, deployed atomically with the code, and free at
runtime. A database earns its place when there is state a deploy cannot carry.

Read this before adding one.

---

## When persistence is actually needed

Add a database when **at least one** of these is true:

- Data outlives a deploy and is written by visitors (leads, bookings, sessions).
- Data changes without a code change and is not the owner's to edit in a PR.
- Two requests must see each other's writes.

If none of these hold, the answer is a typed module in `src/content/`.

---

## D1 vs Durable Object SQLite

Both are SQLite. They differ in where the database lives and who may write to it.

|                      | **D1**                               | **Durable Object SQLite**                                     |
| -------------------- | ------------------------------------ | ------------------------------------------------------------- |
| Shape                | One shared database                  | One database _per object instance_                            |
| Consistency          | Read replicas, eventual reads        | Strong, single-threaded per object                            |
| Best for             | Site-wide tables queried across rows | Per-entity state: a session, a room, a lead's funnel progress |
| Querying             | Familiar SQL across all data         | SQL scoped to one instance only                               |
| Coordination         | None                                 | Built in — the object _is_ the lock                           |
| Cost shape           | Rows read/written                    | Object lifetime + storage                                     |
| Cross-entity queries | Natural                              | Painful; you must fan out                                     |

**Choose D1** when you will ask questions across all the data: "every lead this
month", "case studies by tag".

**Choose a Durable Object** when each entity is independent and needs consistency
or coordination: a live funnel session, a rate limiter, an ISR tag cache shard.

**They compose.** A DO can own hot per-session state and flush summaries to D1.
Do not treat this as either/or if the workload genuinely has both shapes.

---

## The path, decided in advance

Fixed now so nobody improvises under deadline pressure. Applies to whichever
option wins.

### 1. Provision

```bash
# ASK THE OWNER FOR THE NAME FIRST.
npx wrangler d1 create <name>
```

Add the binding to `wrangler.jsonc`, add a row to `docs/cloudflare-resources.md`,
run `npm run check:resources`, then `npm run cf:typegen`.

### 2. ORM: Drizzle

```bash
npm i drizzle-orm && npm i -D drizzle-kit
```

- Schema: `src/server/db/schema.ts` — one file until it genuinely needs splitting.
- Client: `src/server/db/client.ts`, built from `getCloudflareContext().env.DB`.
  Construct it **per request**. A module-level singleton leaks state across
  requests in a Worker.
- Queries live in `src/server/db/queries/`. Route handlers and Server Actions
  call those, never Drizzle directly — it keeps the SQL surface auditable.

### 3. Migrations

```bash
npx drizzle-kit generate            # schema.ts -> SQL, into src/server/db/migrations/
npx wrangler d1 migrations apply <name> --local    # local first, always
npx wrangler d1 migrations apply <name> --remote   # then remote
```

- Migrations are **generated**, never hand-written.
- Migrations are **applied**, never replaced by raw SQL against remote.
- A migration that has been applied to remote is immutable. Fix it forward.

### 4. Local ↔ remote sync

`scripts/d1-sync.mjs`, wired to npm scripts. The direction rule is the important
part:

```
schema:  local ──(migrations only)──▶ remote
data:    local ◀──(dump/restore)──── remote
```

| Command                | Does                                                               | Never does   |
| ---------------------- | ------------------------------------------------------------------ | ------------ |
| `npm run db:sync:down` | Dumps remote to `.d1-dumps/`, loads it into the local Miniflare DB | touch remote |
| `npm run db:sync:up`   | Applies **pending migrations** to remote                           | write rows   |
| `npm run db:studio`    | Opens a shell against the **local** DB                             | touch remote |

This asymmetry means a local experiment can never clobber production data. Do not
"improve" `db:sync:up` into a data push.

Local state lives in `.wrangler/state/` and is disposable — if it is broken,
delete it and re-pull. `.d1-dumps/` contains real production data: git-ignored,
and delete it when you are done (`SECURITY.md` §7).

---

## Consequence today: on-demand revalidation is off

OpenNext's tag cache needs D1 or a sharded Durable Object. We have neither, so:

- `revalidateTag()` and `revalidatePath()` are **no-ops**.
- Time-based `export const revalidate = N` **works**.

Do not build a feature that silently depends on on-demand revalidation. If one is
genuinely needed, that is a reason to provision — go through the process above.
