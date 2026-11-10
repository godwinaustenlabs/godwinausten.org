import type { Metadata } from "next";
import { block, composePage, ModuleRenderer, ScrollStage } from "@/modules";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { servicesCopy } from "@/content/copy/services";
import { MAIN_ID, contactBlock } from "@/content/compositions";

/**
 * `/services` — a vertical document.
 *
 * What we sell, how an engagement runs, and the short version of both. Every
 * section here was the back half of `/about` until the owner split them
 * (2026-10-07), and they are laid out exactly as they were there: the same
 * `services-rows` block in `sections` display, the same `prose-sections` for
 * the method, the same `about-statement` to close.
 *
 * `services-rows` is also on the home page, as columns on the filmstrip — the
 * same block placed twice by two compositions, not a component copied.
 */

export const metadata: Metadata = {
  title: servicesCopy.meta.title,
  description: servicesCopy.meta.description,
};

const services = composePage("services", [
  block("header", "page-header", servicesCopy.header),
  block(
    "services",
    "services-rows",
    { ...servicesCopy.services, display: "sections" },
    { anchor: "expertise" },
  ),
  block("method", "prose-sections", servicesCopy.method, { anchor: "how-we-work" }),
  block("statement", "about-statement", servicesCopy.statement),
  // `04`, not the shared default: this page has three sections in front of the
  // footer, and an "05" after an "03" is the page miscounting itself.
  contactBlock({ index: "04" }),
]);

export default function ServicesPage() {
  return (
    <ScrollStage mainId={MAIN_ID} overlay={<SiteChrome mainId={MAIN_ID} />}>
      <span id="top" className="sr-only" />
      <ModuleRenderer composition={services} />
    </ScrollStage>
  );
}
