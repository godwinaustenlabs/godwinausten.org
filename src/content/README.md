# Content

Typed content modules. This is the project's "database" until there is state a
deploy cannot carry (see `docs/data-layer.md`).

| Folder  | Holds                                                         |
| ------- | ------------------------------------------------------------- |
| `work/` | Case studies — one module per study, exporting a typed object |
| `copy/` | Shared strings: nav labels, CTAs, legal boilerplate           |

## Why not a CMS or a database

Content here is type-checked at build time, diffable in review, deployed
atomically with the code that renders it, and costs nothing at runtime. A case
study that fails its schema fails the build rather than rendering a broken page.

The trade-off is that the owner edits content in a PR, not a dashboard. That is
the right trade for a site with a handful of pages, and it is reversible: the
shape of these modules maps directly onto rows if a CMS ever becomes worth it.

## Conventions

- Every content module exports a zod schema and a value parsed by it.
- Blocks receive content as **props**. A block never imports from `src/content/`
  directly — that would tie it to one page and break the module contract.
- Images referenced here live in R2 (`site-media`), addressed by key.
