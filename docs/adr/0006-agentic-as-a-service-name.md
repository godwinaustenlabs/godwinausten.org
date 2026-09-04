# 0006 — "Agentic" is banned as an adjective and allowed as a service name

**Date:** 2026-09-04
**Status:** accepted
**Amends:** the vocabulary ban in [`docs/brief.md`](../brief.md)

## Context

`docs/brief.md` bans five words — agentic, leverage, seamless, cutting-edge,
robust — and `tests/unit/content-copy.test.ts` enforces the ban across every copy
module on every route. The brief gives its own example of the offence:

> _"Our cutting-edge agentic infrastructure leverages robust, enterprise-grade
> orchestration to deliver seamless automation at scale."_

Every one of those words is an adjective doing no work. That is what the ban is
for, and it has earned its place: it is the difference between the site sounding
like a studio and sounding like every other agency landing page.

On 2026-09-04 the owner specified the four services the site should list, the
first of which is **"full Agentic AI systems"**. That is not an adjective
inflating a noun. It is the name of a thing the company sells, with a definition
underneath it, distinguishing it from the three services beside it — micro
agents, pipelines, and custom work.

So the ban and the owner's instruction collide, and `CLAUDE.md` §2.4 forbids
weakening a check to make something pass without a decision recorded here.

## Decision

Narrow the ban rather than remove it.

`tests/unit/content-copy.test.ts` now strips an explicit `NAMES` allowlist —
currently the single exact string `"Agentic AI Systems"` — from the copy before
applying the word list. Everything else is checked exactly as before.

The distinction is grammatical and it is the one the brief was already making:

- **"Agentic AI Systems"** — a proper noun, exempt.
- **"our agentic approach", "agentic infrastructure"** — adjectives, still fail.

The allowlist is exact strings, not a pattern. Nothing is exempted by accident,
and adding to it is a visible change to a test with this file next to it.

## Consequences

**Easier.** The site can name its own products. A company whose first service is
an agent system could not previously say so, which is a strange place for a
vocabulary rule to end up.

**Harder.** There is now a list to maintain, and a second place to look when the
ban surprises someone. The comment in the test points here.

**Watch for.** The allowlist growing. One proper noun is a definition; five is
the ban being dismantled a word at a time. If a sixth is proposed, the question
to ask is whether the brief's voice has changed — and if it has, that is a
change to the brief, not another line in an array.

## Alternatives

- **Rename the service to avoid the word** — "Full AI Agent Systems". Rejected:
  the owner named their own product, and a rule about marketing prose should not
  get a vote on that.
- **Delete "agentic" from the ban.** Rejected: it is the single most common piece
  of filler in this industry's copy, and the brief's example sentence exists
  precisely because of it. Losing the guard everywhere to permit it in one place
  is the wrong trade.
- **Match whole words with a stricter regex instead of an allowlist.** Rejected:
  it does not help. "Agentic AI Systems" and "our agentic approach" both contain
  the whole word; what separates them is that one is a name, and only a list
  knows that.
