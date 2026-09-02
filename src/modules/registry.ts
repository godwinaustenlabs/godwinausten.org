/**
 * The single place blocks are wired into the app.
 *
 * Adding a block = create `src/modules/blocks/<name>/` and add one line here.
 * Nothing else imports a block directly (enforced by the `no-restricted-imports`
 * rule in eslint.config.mjs).
 *
 * See docs/modules.md.
 */

import type { BlockDefinition } from "./types";
import { heroScribble } from "./blocks/hero-scribble/block.config";
import { pageHeader } from "./blocks/page-header/block.config";
import { experienceFeature } from "./blocks/experience-feature/block.config";
import { servicesRows } from "./blocks/services-rows/block.config";
import { proseSections } from "./blocks/prose-sections/block.config";
import { indexList } from "./blocks/index-list/block.config";
import { pillars } from "./blocks/pillars/block.config";
import { leadMagnet } from "./blocks/lead-magnet/block.config";
import { vslPanel } from "./blocks/vsl-panel/block.config";
import { markField } from "./blocks/mark-field/block.config";
import { aboutStatement } from "./blocks/about-statement/block.config";
import { contactFooter } from "./blocks/contact-footer/block.config";

export const blockRegistry = {
  "hero-scribble": heroScribble,
  "page-header": pageHeader,
  "experience-feature": experienceFeature,
  "services-rows": servicesRows,
  "prose-sections": proseSections,
  "index-list": indexList,
  pillars: pillars,
  "lead-magnet": leadMagnet,
  "vsl-panel": vslPanel,
  "mark-field": markField,
  "about-statement": aboutStatement,
  "contact-footer": contactFooter,
} as const satisfies Record<string, BlockDefinition>;

export type BlockId = keyof typeof blockRegistry;

export function getBlock(id: string): BlockDefinition | undefined {
  return (blockRegistry as Record<string, BlockDefinition>)[id];
}

export function listBlockIds(): string[] {
  return Object.keys(blockRegistry);
}
