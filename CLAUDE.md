# CLAUDE.md

Operating rules for any AI agent working in this repository. These are **hard
constraints**, not suggestions. When a rule here conflicts with a general habit,
this file wins. When a rule here conflicts with an explicit instruction from the
repository owner in the current conversation, the owner wins — but say which rule
you are setting aside and why.

---

## 1. What this project is

`godwinausten.org` — the Godwin Austen Labs marketing site **and** a VSL-driven
sales funnel, built as a **modular block system** and deployed entirely on
Cloudflare.

| Thing       | Choice                                            | Notes                                                                      |
| ----------- | ------------------------------------------------- | -------------------------------------------------------------------------- |
| Framework   | Next.js 16, App Router, React 19                  | Server Components by default                                               |
| Runtime     | Cloudflare Workers (`workerd`)                    | Not Node. Not Vercel.                                                      |
| Adapter     | `@opennextjs/cloudflare`                          | `.open-next/worker.js` is the entrypoint                                   |
| Worker name | `site`                                            | Fixed. Never rename without the owner's say-so.                            |
| Styling     | Tailwind CSS v4 (CSS-first `@theme`)              | Tokens in `src/styles/globals.css`                                         |
| Variants    | `class-variance-authority`                        | Block variants, never ad-hoc ternaries                                     |
| Motion      | `motion` (Motion for React)                       | Applied by the frame, not by blocks                                        |
| Validation  | `zod` v4                                          | Every block prop contract, every input boundary                            |
| Tests       | Vitest (unit + workerd) · Playwright (e2e)        | Three layers, see `tests/README.md`                                        |
| CD          | Cloudflare Workers Builds (**not connected yet**) | Wired to `main` at launch. Today: local `npm run deploy` only, on request. |

---

## 2. The rules that stop things going wrong

### 2.1 Never create Cloudflare resources by hand

Every Cloudflare resource is created with the **wrangler CLI**, and only after
the owner has been asked for the name.

```
Ask for the name  →  npx wrangler <product> create <name>  →  bind it in
wrangler.jsonc  →  add a row to docs/cloudflare-resources.md  →  npm run cf:typegen
```

- **Never** create anything in the Cloudflare dashboard.
- **Never** invent a resource name. Ask. Every time. No exceptions, no "obvious"
  defaults, no `-tmp` or `-test` throwaways.
- **Never** add a binding to `wrangler.jsonc` for a resource that does not exist.
- `npm run check:resources` enforces the registry ↔ config match and runs in CI.
  If it fails, fix the registry — do not weaken the script.

Currently provisioned (the full list — see `docs/cloudflare-resources.md`):

| Binding                    | Type                  | Resource            |
| -------------------------- | --------------------- | ------------------- |
| `ASSETS`                   | Workers static assets | `.open-next/assets` |
| `WORKER_SELF_REFERENCE`    | Service               | `site`              |
| `MEDIA`                    | R2                    | `site-media`        |
| `NEXT_INC_CACHE_R2_BUCKET` | R2                    | `site-isr-cache`    |
| `AI`                       | Workers AI            | —                   |
| `IMAGES`                   | Cloudflare Images     | —                   |

There is **no D1, no KV, no Durable Object, and no queue.** Do not add one to
make a task easier. See §5.

### 2.2 Never write a page by writing JSX in a page file

Pages are **compositions of blocks**, not components. `src/app/**/page.tsx`
should be a short file that builds a `PageComposition` and hands it to
`<ModuleRenderer />`. If you find yourself writing layout markup in a page file,
you are building the wrong thing — make it a block. See §3 and `docs/modules.md`.

### 2.3 Never create placeholder pages or placeholder blocks

The owner adds routes when a route is designed. Route folders exist with a
`.gitkeep` and no `page.tsx` on purpose.

Do **not** create `page.tsx` for `/work`, `/work/[slug]`, `/about`, `/contact`,
`/vsl`, `/privacy`, or `/terms` until explicitly asked. Do not fill
`src/modules/blocks/` with sample blocks. An empty registry is the correct state
until real design work lands.

### 2.4 Never disable a check to make something pass

Forbidden without an explicit owner decision recorded in `docs/adr/`:

- `typescript.ignoreBuildErrors` or `eslint.ignoreDuringBuilds` → `true`
- `// @ts-ignore`, `// @ts-nocheck`, `as any`, `eslint-disable` without a
  one-line reason on the same line
- `.skip` / `.only` left in a committed test
- Deleting or loosening `scripts/check-resources.mjs`
- Widening the CSP or removing a security header (see `SECURITY.md`)

### 2.5 Never commit a secret

Secrets go through `npx wrangler secret put <NAME> --name site`. Locally they go
in `.dev.vars` (git-ignored). `NEXT_PUBLIC_*` values are **public** — they are
inlined into the browser bundle. Full rules in `SECURITY.md`.

### 2.6 Never assume Node

This runs in `workerd`. No filesystem, no `process.cwd()`, no long-lived
in-memory caches across requests, no native modules. Node built-ins work only
via `nodejs_compat`, and only the supported subset. If a library needs the Node
runtime, it does not go in this project — find another way or ask.

**A `next dev` pass is not proof.** `next dev` runs on Node. Before claiming
something works, run `npm run preview` (real workerd) or `npm run test:worker`.

---

## 3. The module (lego block) system

The whole site is assembled from blocks. This is the core architectural bet;
everything else bends around it.

```
src/modules/
├── types.ts                  the contract (BlockDefinition, BlockInstance, PageComposition)
├── define.ts                 defineBlock() authoring helper
├── registry.ts               THE only place blocks are wired in
├── runtime/
│   ├── ModuleRenderer.tsx    composition -> DOM (server component)
│   ├── BlockFrame.tsx        the wrapper every block renders inside (client)
│   ├── CompositionStage.tsx  cross-fades whole compositions, no route change
│   ├── compose.ts            pure transforms: reorder / without / only / patch
│   └── visibility.ts         responsive visibility -> Tailwind classes
└── blocks/<block-name>/      one folder per block
```

### 3.1 Division of responsibility — do not blur this

| Concern                                  | Owned by                                     | A block must NOT                                     |
| ---------------------------------------- | -------------------------------------------- | ---------------------------------------------------- |
| Page margins, max-width, vertical rhythm | `BlockFrame` (via `layout`)                  | set its own `mx-auto`, `max-w-*`, or section padding |
| Enter/exit animation, parallax, reveal   | `BlockFrame` (via `motion`)                  | attach its own scroll listeners                      |
| Responsive show/hide                     | `BlockFrame` (via `visibility`)              | use `hidden md:block` on its own root                |
| Order on the page                        | the composition                              | know what comes before or after it                   |
| Content                                  | `props`, validated by the block's zod schema | fetch its own copy from a global                     |

A block that obeys this can be dropped into any page, at any position, hidden at
any breakpoint, and animated any way — without editing the block. A block that
breaks it becomes a one-page component and defeats the system.

### 3.2 Adding a block

1. `src/modules/blocks/<name>/index.tsx` — the component. Default export.
2. `src/modules/blocks/<name>/block.config.ts` — `defineBlock({ ... })` with a
   zod `schema`, a lazy `load`, and any `defaults`.
3. Register it in `src/modules/registry.ts`. **One line.**
4. Unit-test the block in `tests/unit/blocks/<name>.test.tsx`.

Never import a block directly from a page or another block — ESLint blocks it
(`no-restricted-imports` in `eslint.config.mjs`). Go through the registry.

### 3.3 Visibility is a class toggle, not conditional rendering

`visibilityClasses()` emits `hidden` / `block` utilities so a block stays mounted
in the DOM. That is what lets a block be revealed by a breakpoint change or a
composition transition without remounting and losing video position, form state,
or scroll offset. Do not "optimise" this into `{show && <Block/>}`.

### 3.4 Motion is opt-in and must respect `prefers-reduced-motion`

`BlockFrame` already checks `useReducedMotion()` and `globals.css` neutralises
transitions under the media query. Any new animation must keep both. A funnel
that induces motion sickness does not convert.

---

## 4. Working in this repo

### 4.1 Commands

```bash
npm run dev             # next dev (Node runtime, fast, NOT production-accurate)
npm run dev:remote      # next dev against the REAL site-media / AI bindings
npm run preview         # OpenNext build + workerd preview — the accurate one
npm run typecheck       # tsc --noEmit
npm run lint            # eslint .
npm run test            # unit (jsdom) + worker (workerd)
npm run test:e2e        # Playwright against the workerd preview
npm run ci              # everything CI runs, locally
npm run cf:typegen      # regenerate cloudflare-env.d.ts from wrangler.jsonc
npm run cf:tail         # live production logs
npm run deploy          # build + deploy the `site` worker
npm run deploy:version  # upload a preview version without shifting traffic
```

### 4.2 Definition of done

A change is not done until `npm run ci` passes. Not "the types look right", not
"it renders in dev". Run it.

If work touches a binding, `npm run preview` must also pass — `next dev` cannot
catch workerd-only failures.

### 4.3 Before you add a dependency

Ask, in order:

1. Does it run in `workerd`? (No Node built-ins beyond `nodejs_compat`, no
   native bindings, no filesystem.)
2. What does it cost the client bundle? This is a conversion-critical funnel;
   bundle weight is a business metric.
3. Is there a Cloudflare primitive that already does this?

If the answer to (1) is no or unknown, do not add it — raise it with the owner.

### 4.4 Git

- Work on `dev`. `main` is production.
- **`main` is not connected to Cloudflare yet.** That happens at launch, when
  `dev` is merged. Until then nothing deploys automatically — do not write
  workflows, docs, or code that assume a live production deploy.
- Never commit or push unless asked.
- Never commit `.dev.vars`, `.env*` (except the `.example` files),
  `cloudflare-env.d.ts`, `.wrangler/`, or `.d1-dumps/`.

---

## 5. The data layer (deliberately absent)

**There is no database yet, and that is a decision, not an oversight.**

The site is content-driven; content lives in `src/content/` as typed modules.
Adding a database before there is state to store is how projects acquire
migrations nobody needs.

When persistent state genuinely arrives, the decision is D1 vs Durable Object
SQLite, and it is made by the owner — see `docs/data-layer.md` for the criteria.
Whichever wins, the path is already fixed so nobody improvises:

- **ORM:** Drizzle. `drizzle-orm` + `drizzle-kit`, schema in
  `src/server/db/schema.ts`, generated SQL migrations in
  `src/server/db/migrations/`.
- **Migrations:** generated by `drizzle-kit`, applied with
  `wrangler d1 migrations apply`. **Never** hand-written, **never** applied by
  running raw SQL against remote.
- **Sync direction:** schema flows local → remote through migrations only. Data
  flows remote → local only. `npm run db:sync:down` pulls a remote dump into the
  local Miniflare database; `npm run db:sync:up` applies pending migrations to
  remote and never writes rows. This asymmetry is intentional — a local
  experiment must never be able to clobber production data.
- **Local state** lives in `.wrangler/state/` and is disposable. If it is
  broken, delete it and re-pull.

Rules until then:

- Do not add `d1_databases`, `kv_namespaces`, or `durable_objects` to
  `wrangler.jsonc`.
- Do not install `drizzle-orm`.
- Do not write "temporary" persistence into R2 to dodge this decision.
- `scripts/d1-sync.mjs` exits with instructions rather than doing anything. That
  is the intended behaviour; do not make it "work" by inventing a database.

Note: `revalidateTag()` / `revalidatePath()` are **no-ops** right now, because
OpenNext's tag cache needs D1 or a sharded Durable Object and we have neither.
Time-based `revalidate` works. Do not silently rely on on-demand revalidation.

---

## 6. Documentation duties

Update the doc in the same change as the code — not "later".

| If you change…                               | Update…                                         |
| -------------------------------------------- | ----------------------------------------------- |
| a Cloudflare resource or binding             | `docs/cloudflare-resources.md` (enforced by CI) |
| the block contract or renderer               | `docs/modules.md`                               |
| anything security-relevant                   | `SECURITY.md`                                   |
| a decision that was genuinely arguable       | a new `docs/adr/NNNN-title.md`                  |
| commands, setup, or structure                | `README.md`                                     |
| the design direction or what we are building | `docs/brief.md` — see §7                        |
| scope of the work in flight                  | `docs/sprints/sprint-N.md`                      |

---

## 7. How work flows: inspiration → brief → sprint

```
docs/inspiration/   raw reference material. THE OWNER'S. Always current.
        │
        ▼
docs/brief.md       the standing synthesis: what we are building and why
        │
        ▼
docs/sprints/sprint-N.md    exactly ONE active sprint — the current scope
        │
        ▼ (closed)
docs/sprints/archive/       reference only. NOT a source of requirements.
```

**Nothing is built directly from a reference image.** It goes through the brief
first, so the interpretation is written down and can be corrected before code
exists. Full rules in `docs/sprints/README.md`.

### 7.1 Precedence when sources disagree

1. The owner's instruction in the current conversation
2. `CLAUDE.md` and `SECURITY.md` — a sprint cannot authorise breaking these
3. `docs/brief.md` + `docs/inspiration/` — **always current**; if a sprint
   contradicts the brief, the sprint is stale
4. The active sprint — the current scope
5. `docs/sprints/archive/` — history only

### 7.2 `docs/inspiration/` is the owner's folder

| File                             | Who writes it                                                  |
| -------------------------------- | -------------------------------------------------------------- |
| Images, clips, PDFs, screenshots | **Owner.** Agents read only.                                   |
| `<folder>/notes.md`              | **Owner.** Agents read only.                                   |
| `INDEX.md`                       | **Agent.** The catalogue of what is there and how it was read. |

Never modify, rename, reorganise, or delete the owner's reference files. Never
add a reference of your own — that is not inspiration, it is an agent guessing.

Classify every item as **DECISION** (build to it), **REFERENCE** (direction, open
to discussion), or **UNCLEAR**. **UNCLEAR is a question for the owner, not a
judgement call.** Nothing is built from an unclear reference until it is answered.
Record all three in `INDEX.md` so a misreading is visible before it becomes code.

### 7.3 Sprint discipline

- Exactly one active sprint. Scope is stated as **outcomes**, not tasks.
- **An unchecked box in an archived sprint is not a todo.** If it still matters,
  it is retyped into the current sprint — never linked to.
- Never edit an archived sprint.
- Mid-sprint scope changes are written into the sprint's Scope section before the
  work starts. Silent extra work is not helpfulness.

---

## 8. How to behave when you are unsure

- **Naming a Cloudflare resource** → always ask. Never guess.
- **Adding a route, page, or block** → ask, unless explicitly requested.
- **Adding a dependency or a Cloudflare product** → ask.
- **Choosing between two reasonable implementations** → pick one, do it fully,
  and say in one line what you picked and why.
- **A check fails and you cannot fix it** → say so plainly and show the output.
  Do not disable the check. Do not report the work as done.

---

## 9. The knowledge graph (`graphify-out/`)

The repository is indexed as a knowledge graph in `graphify-out/` — god nodes,
community structure, and cross-file relationships extracted from the code, the
docs, and the image assets. **Use it before you grep.** It answers "what does
this connect to" in a scoped subgraph, which is both cheaper and more accurate
than a keyword sweep across `src/`.

| You want to…                             | Run…                                |
| ---------------------------------------- | ----------------------------------- |
| Answer a question about the codebase     | `graphify query "<question>"`       |
| Understand how two things relate         | `graphify path "<A>" "<B>"`         |
| Get a focused explanation of one concept | `graphify explain "<concept>"`      |
| Review the architecture broadly          | read `graphify-out/GRAPH_REPORT.md` |

Rules:

- For any codebase question, run `graphify query` **first**, whenever
  `graphify-out/graph.json` exists. Fall back to `grep`/`Glob` only when the
  graph does not surface enough context.
- `GRAPH_REPORT.md` is for broad architecture review, not for answering a
  specific question — `query`/`path`/`explain` return far less to read.
- After changing code, run `graphify update .` to keep the graph current. This is
  AST-only: deterministic, no LLM, no API cost.
- After changing **docs or images**, run `/graphify --update` instead — those need
  semantic re-extraction, which `graphify update` skips.
- `graphify-out/` is build output. Never hand-edit `graph.json`,
  `GRAPH_REPORT.md`, or anything else in it; regenerate instead.
