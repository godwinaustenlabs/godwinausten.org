import type { ComponentType } from "react";
import { getBlock } from "../registry";
import { BlockFrame } from "./BlockFrame";
import type { PageComposition } from "../types";

/**
 * Renders a `PageComposition`. This is the only component that knows how to
 * turn composition data into DOM.
 *
 * Server component on purpose: each block is `await import()`ed here, so a page
 * only ships the JS for the blocks it actually places.
 */
export async function ModuleRenderer({ composition }: { composition: PageComposition }) {
  const rendered = await Promise.all(
    composition.blocks.map(async (instance) => {
      const definition = getBlock(instance.block);

      if (!definition) {
        if (process.env.NODE_ENV === "production") return null;
        throw new Error(
          `Unknown block "${instance.block}" in composition "${composition.id}". ` +
            `Register it in src/modules/registry.ts.`,
        );
      }

      // Validate at the boundary so a bad composition fails here with a useful
      // message rather than deep inside the block's render.
      const parsed = definition.schema.safeParse(instance.props);
      if (!parsed.success) {
        if (process.env.NODE_ENV === "production") return null;
        throw new Error(
          `Invalid props for block "${instance.block}" (key "${instance.key}"): ` +
            JSON.stringify(parsed.error.issues, null, 2),
        );
      }

      // The schema validated these props, but the registry is heterogeneous, so
      // the concrete prop type is only known at runtime.
      const Component = (await definition.load()).default as ComponentType<Record<string, unknown>>;

      return (
        <BlockFrame
          key={instance.key}
          blockId={instance.block}
          instanceKey={instance.key}
          anchor={instance.anchor}
          layout={{ ...definition.defaults?.layout, ...instance.layout }}
          motion={{ ...definition.defaults?.motion, ...instance.motion }}
          visibility={instance.visibility}
        >
          <Component {...(parsed.data as Record<string, unknown>)} />
        </BlockFrame>
      );
    }),
  );

  return <>{rendered}</>;
}
