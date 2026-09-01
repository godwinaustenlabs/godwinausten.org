import type { z } from "zod";
import type { BlockDefinition } from "./types";

/**
 * Authoring helper for a block definition. Exists purely to get inference
 * right: `defineBlock` ties the schema to the component's prop type so a
 * mismatch is a compile error, not a runtime surprise.
 *
 * Usage lives in each block's `block.config.ts` — see docs/modules.md.
 */
export function defineBlock<const Id extends string, S extends z.ZodType>(
  def: BlockDefinition<Id, S>,
): BlockDefinition<Id, S> {
  return def;
}
