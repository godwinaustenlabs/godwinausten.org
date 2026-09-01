# Sprints

How work is scoped and executed in this repo.

## The lifecycle

```
docs/inspiration/     raw reference material — the owner's, always current
        │
        ▼
docs/brief.md         the standing synthesis: what we are building and why
        │
        ▼
docs/sprints/sprint-N.md      ONE active sprint — the current scope of work
        │
        ▼ (done)
docs/sprints/archive/         reference only. NOT a source of requirements.
```

## The precedence rule

When two sources disagree, higher wins:

1. **The owner's instruction in the current conversation.**
2. **`CLAUDE.md` and `SECURITY.md`** — hard constraints. A sprint cannot
   authorise creating an unnamed Cloudflare resource or skipping a security
   requirement.
3. **`docs/brief.md` + `docs/inspiration/`** — the standing design truth. These
   are **always current**. If a sprint contradicts the brief, the brief is right
   and the sprint is stale.
4. **The active sprint** — the current scope. Defines what to build _now_.
5. **`docs/sprints/archive/`** — history. Read it to understand why something is
   the way it is. **Never** to decide what to build.

## Rules

- **Exactly one active sprint** at a time, at `docs/sprints/sprint-N.md`.
- **Archived sprints are inert.** An unchecked box in an archived sprint is not a
  todo. If it still matters, it gets carried into the new sprint explicitly.
- **Never edit an archived sprint.** It records what was decided at the time.
- **The brief outranks the sprint.** Inspiration and the brief keep moving; a
  sprint is a snapshot. When they conflict, update the sprint — not the brief.
- **Scope changes go in the sprint,** not into silent extra work. If the owner
  adds something mid-sprint, write it into the sprint's Scope section first.

## Closing a sprint

1. Mark every item done, cut, or carried.
2. Fill in the **Outcome** section — what shipped, what was cut and why, what
   surprised us. This is the part future-you actually reads.
3. `git mv docs/sprints/sprint-N.md docs/sprints/archive/`
4. Anything carried forward is **retyped** into the new sprint. Never
   cross-referenced — a link into the archive turns an inert document back into a
   live one.

## Starting a sprint

Copy `TEMPLATE.md` to `sprint-N.md`. Every sprint states its scope as a list of
**outcomes**, not tasks — "the hero block renders the VSL and tracks play events",
not "write HeroVsl.tsx". Tasks change; outcomes are what we agreed.
