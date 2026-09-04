import type { Metadata } from "next";
import { block, composePage, ModuleRenderer, ScrollStage } from "@/modules";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { aboutCopy } from "@/content/copy/about";
import { MAIN_ID, contactBlock } from "@/content/compositions";

/**
 * `/about` — a vertical document.
 *
 * The shape follows oddcommon's `/expertise`: three tiles stating the shape of
 * the answer before any prose, then what we do, then the numbered principles of
 * working with us. A reader arriving here wants the shape immediately; three
 * words give it faster than a paragraph can.
 *
 * `services-rows` appears here and on the home page — the same block placed
 * twice by two compositions, not a component copied.
 */

export const metadata: Metadata = {
  title: aboutCopy.meta.title,
  description: aboutCopy.meta.description,
};

const about = composePage("about", [
  block("header", "page-header", aboutCopy.header),
  block("pillars", "pillars", aboutCopy.pillars),
  block(
    "services",
    "services-rows",
    { ...aboutCopy.services, display: "sections" },
    { anchor: "expertise" },
  ),
  block("method", "prose-sections", aboutCopy.method, { anchor: "how-we-work" }),
  block("statement", "about-statement", aboutCopy.statement),
  contactBlock(),
]);

export default function AboutPage() {
  return (
    <ScrollStage mainId={MAIN_ID} overlay={<SiteChrome mainId={MAIN_ID} />}>
      <span id="top" className="sr-only" />
      <ModuleRenderer composition={about} />
    </ScrollStage>
  );
}
