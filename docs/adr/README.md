# Architecture Decision Records

One file per decision that was genuinely arguable. Not a log of everything —
a record of the choices whose reasoning would otherwise be lost.

## When to write one

- Two reasonable options existed and one was picked.
- A rule in `CLAUDE.md` or `SECURITY.md` is being deliberately set aside.
- A Cloudflare product was adopted or rejected.
- Something was tried and abandoned. (These are the most valuable ones — they
  stop the next person re-trying it.)

Do not write one for a decision with an obvious answer.

## Format

`NNNN-short-title.md`, numbered sequentially:

```markdown
# 0001 — Short title

**Date:** 2026-08-31
**Status:** accepted | superseded by 0007 | reversed

## Context

What forced a decision. Constraints that were real at the time.

## Decision

What we chose, stated plainly.

## Consequences

What this makes easy. What it makes hard. What we accepted losing.

## Alternatives

What else was considered, and the specific reason each was rejected.
```
