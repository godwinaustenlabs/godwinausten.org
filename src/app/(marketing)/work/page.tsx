import type { Metadata } from "next";
import { block, composePage, ModuleRenderer, ScrollStage } from "@/modules";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { workCopy } from "@/content/copy/work";
import { experiences } from "@/content/work/experiences";
import { MAIN_ID, contactBlock } from "@/content/compositions";

/**
 * `/work` — the index.
 *
 * A section per experience, each linking to its own page. The build story used
 * to live here, underneath the one entry; that only worked while there was one
 * entry, and it made the index and the detail the same page. Now the index
 * stays an index and `/work/[slug]` carries the depth.
 *
 * A vertical document, not a filmstrip: this is a thing being read at the
 * reader's pace, and horizontal travel makes that harder rather than more
 * interesting.
 */

export const metadata: Metadata = {
  title: workCopy.meta.title,
  description: workCopy.meta.description,
};

const work = composePage("work", [
  block("header", "page-header", workCopy.header),
  block(
    "index",
    "index-list",
    {
      heading: workCopy.indexHeading,
      entries: experiences.map((experience) => ({
        index: experience.index,
        title: experience.name,
        summary: experience.summary,
        client: experience.client,
        services: experience.services,
        href: `/work/${experience.slug}`,
        runtime: experience.runtime,
        ...(experience.src ? { src: experience.src } : {}),
      })),
    },
    { anchor: "index" },
  ),
  contactBlock(),
]);

export default function WorkPage() {
  return (
    <ScrollStage mainId={MAIN_ID} overlay={<SiteChrome mainId={MAIN_ID} />}>
      <span id="top" className="sr-only" />
      <ModuleRenderer composition={work} />
    </ScrollStage>
  );
}
