# Blocks

Six blocks, all placed by the home page: `hero-scribble`, `work-grid`,
`services-rows`, `about-statement`, `vsl-optin`, `contact-footer`.

Nothing else is here. Blocks are added when a real section is designed, never as
placeholders (`CLAUDE.md` §2.3). The inventory lives in `docs/brief.md`.

## Shape of a block

```
src/modules/blocks/<block-name>/
├── index.tsx         the component, default export, no page layout of its own
├── block.config.ts   defineBlock({ id, displayName, schema, load, defaults })
└── parts/            block-private sub-components — never imported from outside
```

Then one line in `src/modules/registry.ts`, and a test in
`tests/unit/blocks/<block-name>.test.tsx`.

The full authoring guide, with a worked example, is in `docs/modules.md`.

## The one rule

A block never knows where it is. No `mx-auto`, no `max-w-*`, no section padding,
no `hidden md:block`, no scroll listeners, and **no knowledge of which scroll
mode is running**. `BlockFrame` owns all of it. That is what lets the same block
be placed anywhere, hidden at any breakpoint, animated any way, and laid out as a
horizontal filmstrip panel — without editing the block.

Two things the frame _publishes_ for a block to use: `px-gutter` for the page
gutter, and the `--block-progress` custom property for scroll-linked motion in
plain CSS. Both are in `docs/modules.md`.
