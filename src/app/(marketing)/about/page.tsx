import type { Metadata } from "next";
import { block, composePage, ModuleRenderer, ScrollStage } from "@/modules";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { aboutCopy } from "@/content/copy/about";
import { MAIN_ID, contactBlock } from "@/content/compositions";

/**
 * `/about` — a vertical document.
 *
 * Who we are, and nothing we sell. The charter explains the three parts of the
 * company — Services, the Labs, the Academy — and ends on the mission and the
 * vision; the page then closes on what anyone dealing with us can hold us to.
 *
 * The offerings and the method used to follow the charter. The owner moved them
 * to `/services` (2026-10-07): a reader deciding whether we are real should not
 * have to scroll through a price list to find out, and a reader who came for the
 * price list should not have to read the charter to reach it.
 */

export const metadata: Metadata = {
  title: aboutCopy.meta.title,
  description: aboutCopy.meta.description,
};

const about = composePage("about", [
  block("header", "page-header", aboutCopy.header),
  block("charter", "charter", aboutCopy.charter, { anchor: "who-we-are" }),
  block("expectations", "prose-sections", aboutCopy.expectations, {
    anchor: "what-to-expect",
  }),
  block("statement", "about-statement", aboutCopy.statement),
  contactBlock({ index: "04" }),
]);

export default function AboutPage() {
  return (
    <ScrollStage mainId={MAIN_ID} overlay={<SiteChrome mainId={MAIN_ID} />}>
      <span id="top" className="sr-only" />
      <ModuleRenderer composition={about} />
    </ScrollStage>
  );
}
