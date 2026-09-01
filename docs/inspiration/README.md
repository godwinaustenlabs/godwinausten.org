# Inspiration

Reference material for design direction. **The owner's folder.** Always current —
if something here contradicts a sprint, this wins (`docs/sprints/README.md`).

## Who writes what

| File | Owned by | Rule |
| --- | --- | --- |
| Images, clips, PDFs, screenshots | **Owner** | Agents read only. Never modify, rename, reorganise, or delete. |
| `<folder>/notes.md` | **Owner** | Agents read only. This is where intent is stated. |
| `INDEX.md` | **Agent** | Maintained catalogue of what is here and what it means. Rebuilt as material arrives. |
| `docs/brief.md` | **Agent** | The synthesis. Derived from everything here. |

An agent adding a reference of its own is not inspiration — it is an agent
guessing. Don't.

## Folders

| Folder | For |
| --- | --- |
| `brand/` | Logos, palettes, identity references, tone |
| `layout/` | Page structures, grids, section arrangements |
| `motion/` | Scroll behaviour, transitions, parallax references (clips, GIFs, links) |
| `typography/` | Type pairings, scale, treatment |
| `funnel/` | VSL pages, CTA patterns, form flows worth stealing from |

Add a folder if the material needs one. Don't force a reference into a folder it
does not belong in.

## The thing that makes this useful

**Say whether a reference is a decision or a reference.** Without it, an agent
cannot tell "I like this" from "build this", and will guess — usually wrong, and
usually confidently.

A one-line `notes.md` in the folder is enough:

```
hero-parallax.mp4   DECISION — this is the scroll feel for the landing hero.
grid-b.png          REFERENCE — like the density, not the colours.
serif-pairing.png   REFERENCE — direction only, we have not picked a typeface.
brand-marks.pdf     DECISION — final logo lockup, do not redraw.
```

Three words of context turn a folder of images into a spec.

## How it flows into code

```
docs/inspiration/  →  docs/brief.md  →  docs/sprints/sprint-N.md  →  src/modules/blocks/
   (owner)             (agent)             (agreed scope)               (built)
```

Nothing gets built from a reference directly. It goes through the brief first, so
the interpretation is written down and can be corrected before code exists.

## Git

Binary reference files are **git-ignored** (see `.gitignore`) — they are large and
often licensed. `notes.md`, `INDEX.md`, and `.gitkeep` are committed, so the
structure and the decisions survive even though the imagery stays local.

To share a specific reference with the team, commit it deliberately with
`git add -f` and keep it small.
