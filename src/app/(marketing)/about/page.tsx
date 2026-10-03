import type { Metadata } from "next";
import { block, composePage, ModuleRenderer, ScrollStage } from "@/modules";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { aboutCopy } from "@/content/copy/about";
import { MAIN_ID, contactBlock } from "@/content/compositions";

/**
 * `/about` — a vertical document.
 *
 * The page opens on what the company is *for* and then says what it sells.
 *
 * It used to open on three tiles — Map, Build, Tune — after oddcommon's
 * `/expertise`, on the argument that a reader arriving on a sub-route wants the
 * shape of the answer before any prose. The owner cut them, and the page is
 * better for it: those three words were a summary of `method` further down the
 * same page, so the masthead was followed immediately by a compressed version of
 * a section the reader had not reached yet. `charter` is the opening now, which
 * answers the question a stranger actually arrives with.
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
  // The pictures come from the copy module now, like every other asset a page
  // names. `ASCENT_FIGURE` — the generated wire figure that used to sit here —
  // is regenerable from `npm run gen:ascent` if it is ever wanted back.
  block("charter", "charter", aboutCopy.charter, { anchor: "who-we-are" }),
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
