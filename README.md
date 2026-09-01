# godwinausten.org

The Godwin Austen Labs website and VSL funnel. Next.js 16 on Cloudflare Workers,
built as a modular block system.

**Everything runs on Cloudflare:** Workers for compute, R2 for media and the ISR
cache, Workers AI for inference, Cloudflare Images for transformation, Workers
Builds for CI/CD.

---

## Quick start

```bash
npm install
cp .dev.vars.example .dev.vars     # local Worker secrets (git-ignored)
npm run cf:typegen                 # generate binding types from wrangler.jsonc
npm run dev                        # http://localhost:3000
```

Requires Node ≥ 20.9 and a Cloudflare login (`npx wrangler login`).

> `npm run dev` uses the **Node** runtime and is fast but not production-accurate.
> Before trusting a change, run `npm run preview` — that is the real `workerd`.

---

## Commands

### Develop

| Command              | What it does                                                      |
| -------------------- | ----------------------------------------------------------------- |
| `npm run dev`        | Next dev server. Bindings are local Miniflare simulations.        |
| `npm run dev:remote` | Next dev server against the **real** `site-media` and Workers AI. |
| `npm run preview`    | OpenNext build + `workerd` preview. Production-accurate.          |

### Quality

| Command                           | What it does                                                 |
| --------------------------------- | ------------------------------------------------------------ |
| `npm run typecheck`               | `tsc --noEmit`                                               |
| `npm run lint` / `lint:fix`       | ESLint                                                       |
| `npm run format` / `format:check` | Prettier                                                     |
| `npm run check:resources`         | Fails if `wrangler.jsonc` and the resource registry disagree |
| `npm run gen:scribble`            | Regenerate the hero scribble figure                          |
| `npm run gen:stills`              | Regenerate the work-tile placeholder stills                  |
| `npm run ci`                      | Everything CI runs, locally                                  |

### Test

| Command                 | Layer         | Runtime                                        |
| ----------------------- | ------------- | ---------------------------------------------- |
| `npm run test:unit`     | Unit          | jsdom                                          |
| `npm run test:worker`   | Integration   | `workerd` (Miniflare, real bindings simulated) |
| `npm run test:e2e`      | End-to-end    | Chromium against the `workerd` preview         |
| `npm test`              | unit + worker |                                                |
| `npm run test:coverage` |               |                                                |

See `tests/README.md` for which layer a test belongs in.

### Deploy

| Command                  | What it does                                      |
| ------------------------ | ------------------------------------------------- |
| `npm run deploy`         | Build + deploy the `site` worker                  |
| `npm run deploy:version` | Upload a preview version without shifting traffic |
| `npm run cf:tail`        | Live production logs                              |
| `npm run cf:versions`    | List deployed versions                            |

### Cloudflare

| Command              | What it does                                                          |
| -------------------- | --------------------------------------------------------------------- |
| `npm run cf:typegen` | Regenerate `cloudflare-env.d.ts` — run after **every** binding change |
| `npm run cf:whoami`  | Confirm which account you are on                                      |
| `npm run cf:secrets` | List secret names bound to `site`                                     |

---

## Structure

```
├── src/
│   ├── app/                 routes — thin; a page builds a composition
│   ├── modules/             THE BLOCK SYSTEM
│   │   ├── types.ts         the contract
│   │   ├── registry.ts      the only place blocks are wired in
│   │   ├── runtime/         renderer, frame, scroll engine, composition transforms
│   │   └── blocks/          one folder per block
│   ├── components/          ui / motion / layout primitives — not blocks
│   ├── content/             typed content modules (the current "database")
│   ├── server/              Server Actions, services, future db/
│   ├── lib/                 binding access, env, utils
│   └── styles/              Tailwind v4 tokens
├── tests/                   unit · integration (workerd) · e2e (Playwright)
├── scripts/                 asset generators, resource registry check, D1 sync
├── public/assets/           GENERATED artwork — see scripts/, never edit by hand
├── docs/
│   ├── brief.md                  what we are building and why — outranks any sprint
│   ├── sprints/                  one active sprint + archive/ (reference only)
│   ├── inspiration/              owner's reference material — read-only for agents
│   ├── cloudflare-resources.md   every resource we own — enforced by CI
│   ├── modules.md                how to write and compose blocks
│   ├── architecture.md           request path and layering
│   ├── data-layer.md             why there is no database, and the path if one is needed
│   ├── funnel.md                 the VSL conversion path
│   └── adr/                      architecture decision records
├── CLAUDE.md                rules for AI agents working in this repo
├── SECURITY.md              secrets, headers, input handling, open items
└── wrangler.jsonc           Worker config — the `site` worker
```

---

## How the site is built

Pages are **compositions of blocks**, not components:

```tsx
const home = composePage("home", [
  block("hero", "hero-scribble", { ...copy.hero }),
  block("work", "work-grid", copy.work, { anchor: "work" }),
  block("about", "about-statement", copy.about, { anchor: "about" }),
]);

export default function HomePage() {
  return (
    <ScrollStage mainId="main" overlay={<SiteChrome mainId="main" />}>
      <ModuleRenderer composition={home} />
    </ScrollStage>
  );
}
```

`/work` and `/about` are the same idea with a different arrangement. Between
them they cost **one** new block (`page-header`) and two content files —
everything else on those pages is a component the home page already uses.

A block never knows where it is — width, spacing, motion, filmstrip panel size,
and responsive visibility are all applied by `BlockFrame`. That is what lets the
same block be placed on any page, hidden at any breakpoint, animated any way, and
reordered into an A/B variant, all without editing the block.

Read `docs/modules.md` before writing one.

### The two scroll modes

At `≥1200px`, and only when the visitor has not asked for reduced motion, the
**home page** lays itself out as a horizontal filmstrip: vertical scroll moves
the page sideways. `/work`, `/about` and `/contact` are ordinary vertical
documents at every width — horizontal travel suits an argument made at our pace,
and makes a page of explanation harder to read rather than more interesting.

It is the same composition and the same DOM in both. Panel sizing is a CSS
`strip:` variant keyed off `data-scroll-mode` on `<html>`, so the vertical
fallback is what renders on the server and there is no layout flash. The
mechanism is a spacer plus a transform — the browser's own scrollbar, trackpad
momentum, Page Down and find-in-page keep working, and there is no scroll-jacking
library. See `docs/adr/0002-horizontal-scroll-without-gsap.md`.

### The layout system

Everything is a **cell**. A fixed bar at the top of the page and another at the
bottom define a band; every panel is exactly that tall and never more, and
inside it content sits in cells separated by a one-pixel seam. Eyebrows are bars
flush to a cell's top edge, actions are bars flush to its bottom.

Cells are small and varied on purpose — big type punctuated by little tiles at
alternating edges — because a panel of three equal boxes reads as a table. Each
panel ends by naming the one after it, which is what keeps a scroll feeling like
one page.

Two exceptions worth knowing: the **hero** is a single full-bleed image rather
than a grid, and in vertical flow a panel is content-height rather than a fixed
band.

Navigation is a single rail at the foot of every page. The top bar carries the
wordmark and nothing else.

`src/components/ui/{Panel,Cell}.tsx`, tokens in `globals.css`.

### Loading and moving between routes

The logomark curtain from the live godwinausten.org: it drops **down** to cover
and **up** to reveal, on first load and on every navigation. The mark is the
owner's, lifted verbatim, and it writes itself on before the curtain lifts.

`RouteTransition` owns the timing (cover, push, reveal); `SiteLoader` is the
curtain. Degrades to a plain navigation under `prefers-reduced-motion` or with
no JS.

Use `SiteLink` for every internal link. It routes a click to the right
mechanism — the stage for `#anchors`, the transition for `/routes` — and stays a
real `<a href>` so ⌘-click and crawlers keep working.

### Generated artwork

Everything visual on the site is produced by a seeded script in this repo —
nothing third-party ships (`docs/adr/0003-…`).

| Command                | Produces                            |
| ---------------------- | ----------------------------------- |
| `npm run gen:scribble` | `public/assets/scribble-figure.svg` |
| `npm run gen:stills`   | `public/assets/tiles/*.svg`         |

Both are deterministic: regenerating with an unchanged script produces
byte-identical output. Tune the parameters in the script, never the SVG.

---

## Cloudflare resources

| Binding                    | Type                  | Resource         |
| -------------------------- | --------------------- | ---------------- |
| `ASSETS`                   | Workers static assets | build output     |
| `WORKER_SELF_REFERENCE`    | Service               | `site`           |
| `MEDIA`                    | R2                    | `site-media`     |
| `NEXT_INC_CACHE_R2_BUCKET` | R2                    | `site-isr-cache` |
| `AI`                       | Workers AI            | —                |
| `IMAGES`                   | Cloudflare Images     | —                |

**Resources are only ever created with the wrangler CLI, and only after the owner
has been asked for the name.** Never the dashboard. Every binding must have a row
in `docs/cloudflare-resources.md`; `npm run check:resources` fails CI otherwise.

There is deliberately **no D1, KV, Durable Object, or Queue** — see
`docs/data-layer.md`.

---

## CI/CD

**Deploys are not automated yet.** `main` will be connected to Cloudflare Workers
Builds at launch, when `dev` is merged. Until then nothing deploys on push —
`npm run deploy` from a machine is the only path, and it is run deliberately.

Planned, once `main` is connected:

| Field             | Value                              |
| ----------------- | ---------------------------------- |
| Build command     | `npm run ci:build`                 |
| Deploy command    | `npx opennextjs-cloudflare deploy` |
| Production branch | `main`                             |
| Node version      | 20 or newer                        |

Because Workers Builds pulls from the connected repo, no Cloudflare credentials
ever live in the repo or in GitHub secrets.

**Quality gates** already run in GitHub Actions (`.github/workflows/ci.yml`) on
every push and pull request to `main` and `dev`: resource-registry check,
typecheck, lint, format, unit tests, workerd integration tests, `npm audit`, and
a production build.

---

## How work is scoped

```
docs/inspiration/   reference material — the owner's, always current
        │
        ▼
docs/brief.md       what we are building and why — the standing synthesis
        │
        ▼
docs/sprints/sprint-N.md    exactly one active sprint
        │
        ▼ (closed)
docs/sprints/archive/       reference only, never a source of requirements
```

Nothing is built straight from a reference image — it goes through the brief
first, so the interpretation is written down and correctable before code exists.
Rules in `docs/sprints/README.md`.

## Status

On `dev`. **Four routes are built** — `/`, `/work`, `/about` and `/contact` —
from eleven blocks, all real copy, on a cell grid. The home page is a funnel that
runs as a horizontal filmstrip on wide desktop; the sub-routes are vertical
documents. See `docs/sprints/sprint-1.md`.

`/work/[slug]`, `/vsl`, `/privacy` and `/terms` still have no `page.tsx`,
deliberately (`CLAUDE.md` §2.3).

Lead-magnet submissions are **validated and logged, not stored** — there is no
database and adding one for a single email is the improvisation `CLAUDE.md` §5
forbids. `deliver()` in `src/server/actions/lead-magnet.ts` is the seam.

Before launch on the custom domain, `SECURITY.md` §10 must be cleared — the CSP
in particular.

## Docs

| Read this                      | For                                                      |
| ------------------------------ | -------------------------------------------------------- |
| `CLAUDE.md`                    | Rules for AI agents. Read first if you are one.          |
| `SECURITY.md`                  | Secrets, headers, input handling, open security items    |
| `docs/modules.md`              | Writing and composing blocks                             |
| `docs/architecture.md`         | Request path, layering, caching                          |
| `docs/cloudflare-resources.md` | Every resource we own, and how to add one                |
| `docs/data-layer.md`           | Why there is no database, and what happens when there is |
| `docs/funnel.md`               | The VSL conversion path                                  |
| `docs/brief.md`                | What we are building and why — outranks any sprint       |
| `docs/adr/`                    | Why a genuinely arguable decision went the way it did    |
| `tests/README.md`              | Which test layer to use                                  |
