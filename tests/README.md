# Tests

Three layers, three runtimes. Put a test in the cheapest layer that can actually
prove the thing.

| Layer       | Runtime                                      | Lives in             | Run with              |
| ----------- | -------------------------------------------- | -------------------- | --------------------- |
| Unit        | jsdom                                        | `tests/unit/`        | `npm run test:unit`   |
| Integration | workerd (Miniflare)                          | `tests/integration/` | `npm run test:worker` |
| E2E         | Chromium against the OpenNext Worker preview | `tests/e2e/`         | `npm run test:e2e`    |

## Which layer?

- **Unit** — composition helpers, class builders, pure block logic, React blocks
  rendered with Testing Library. No bindings, no network.
- **Integration** — anything reading a Cloudflare binding (`MEDIA`, `AI`,
  `IMAGES`), route handlers, cache behaviour. Bindings are local simulations
  driven by `wrangler.jsonc`; nothing here touches the real account.
- **E2E** — user-visible flows: the funnel, navigation, form submission,
  security headers. Runs against `opennextjs-cloudflare preview`, i.e. the same
  workerd runtime production uses.

## Conventions

- One `describe` per exported unit; test names read as sentences.
- No snapshot tests for markup — assert behaviour, not DOM shape.
- `tests/fixtures/` holds shared sample compositions and content.
- Integration tests may write to R2; namespace keys under `test/` so a stray run
  against a real binding is obvious and cleanable.
