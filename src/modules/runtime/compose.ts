import type {
  BlockInstance,
  BlockLayout,
  BlockMotion,
  BlockPresence,
  PageComposition,
  ResponsiveVisibility,
} from "../types";

/**
 * Composition helpers — the "how you snap the lego together" layer.
 *
 * These are pure data transforms over `PageComposition`. Keeping them pure is
 * what makes reordering, hiding, and A/B variants of a page cheap to test:
 * a composition is just an array, so a funnel variant is a function of a
 * composition, not a forked component tree.
 */

export function block<P>(
  key: string,
  id: string,
  props: P,
  options: {
    anchor?: string;
    layout?: BlockLayout;
    motion?: BlockMotion;
    visibility?: ResponsiveVisibility;
    presence?: BlockPresence;
  } = {},
): BlockInstance<string, P> {
  return { key, block: id, props, ...options };
}

export function composePage(id: string, blocks: BlockInstance[]): PageComposition {
  assertUniqueKeys(blocks);
  return { id, blocks };
}

/** Fails fast: duplicate keys silently break React identity and motion state. */
function assertUniqueKeys(blocks: BlockInstance[]): void {
  const seen = new Set<string>();
  for (const b of blocks) {
    if (seen.has(b.key)) {
      throw new Error(`Duplicate block key "${b.key}" in composition.`);
    }
    seen.add(b.key);
  }
}

/** Drop blocks by key — e.g. a funnel variant that removes social proof. */
export function without(composition: PageComposition, ...keys: string[]): PageComposition {
  const drop = new Set(keys);
  return { ...composition, blocks: composition.blocks.filter((b) => !drop.has(b.key)) };
}

/** Keep only the listed keys, in the order given. Unknown keys are ignored. */
export function only(composition: PageComposition, ...keys: string[]): PageComposition {
  const byKey = new Map(composition.blocks.map((b) => [b.key, b]));
  return {
    ...composition,
    blocks: keys.flatMap((k) => {
      const found = byKey.get(k);
      return found ? [found] : [];
    }),
  };
}

/**
 * Reorder ("scramble") blocks. Listed keys come first in the order given; any
 * unlisted blocks keep their relative order at the end.
 */
export function reorder(composition: PageComposition, order: string[]): PageComposition {
  const rank = new Map(order.map((k, i) => [k, i]));
  const next = [...composition.blocks].sort((a, b) => {
    const ra = rank.get(a.key) ?? Number.MAX_SAFE_INTEGER;
    const rb = rank.get(b.key) ?? Number.MAX_SAFE_INTEGER;
    return ra - rb;
  });
  return { ...composition, blocks: next };
}

/** Insert blocks after a given key. Appends if the anchor isn't found. */
export function insertAfter(
  composition: PageComposition,
  anchorKey: string,
  ...blocks: BlockInstance[]
): PageComposition {
  const index = composition.blocks.findIndex((b) => b.key === anchorKey);
  const next = [...composition.blocks];
  next.splice(index === -1 ? next.length : index + 1, 0, ...blocks);
  return composePage(composition.id, next);
}

/** Shallow-merge overrides onto one block instance. */
export function patch(
  composition: PageComposition,
  key: string,
  overrides: Partial<Omit<BlockInstance, "key" | "block">>,
): PageComposition {
  return {
    ...composition,
    blocks: composition.blocks.map((b) => (b.key === key ? { ...b, ...overrides } : b)),
  };
}
