# Components

Cross-block building material. **These are not blocks** — they are never placed
in a composition and never appear in the registry.

| Folder    | Holds                                                                                              |
| --------- | -------------------------------------------------------------------------------------------------- |
| `ui/`     | Primitives: buttons, inputs, headings, cards. Variants via `cva`.                                  |
| `motion/` | Reusable motion pieces used _inside_ blocks. Frame-level motion belongs to `BlockFrame`, not here. |
| `layout/` | Chrome that lives outside the composition: header, footer, nav.                                    |

## The line between a component and a block

A **block** is a section a page places — it has a registry id, a zod prop schema,
and it renders inside a `BlockFrame`.

A **component** is something a block is built out of. It has no id, no schema,
and no opinion about page position.

If you are unsure: could this appear at an arbitrary position on a page, on its
own? Then it is a block. Is it a button? Then it is a component.

## Rules

- Primitives own no page layout — no `mx-auto`, no `max-w-*`, no section padding.
  Those belong to `BlockFrame`.
- Variants go through `cva`, not chains of ternaries.
- Colours come from the tokens in `src/styles/globals.css`. No raw hex.
