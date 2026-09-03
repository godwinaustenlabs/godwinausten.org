import type { Metadata } from "next";
import { block, composePage, ModuleRenderer, ScrollStage } from "@/modules";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { workCopy } from "@/content/copy/work";
import { experiences } from "@/content/work/experiences";
import { mediaSrc } from "@/server/media";
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

/**
 * Built per request rather than at module load, because each row's reel is a
 * question for the media layer: is there an object at this experience's key yet,
 * and if not is there a stand-in? Same reason the home page composes in a
 * function — see `src/app/page.tsx`.
 */
async function workComposition() {
  const reels = await Promise.all(experiences.map((experience) => mediaSrc(experience.media)));

  return composePage("work", [
    block("header", "page-header", workCopy.header),
    block(
      "index",
      "index-list",
      {
        heading: workCopy.indexHeading,
        entries: experiences.map((experience, i) => ({
          index: experience.index,
          title: experience.name,
          summary: experience.summary,
          client: experience.client,
          services: experience.services,
          href: `/work/${experience.slug}`,
          runtime: experience.runtime,
          ...(reels[i] ? { src: reels[i] } : {}),
        })),
      },
      { anchor: "index" },
    ),
    contactBlock(),
  ]);
}

export default async function WorkPage() {
  return (
    <ScrollStage mainId={MAIN_ID} overlay={<SiteChrome mainId={MAIN_ID} />}>
      <span id="top" className="sr-only" />
      <ModuleRenderer composition={await workComposition()} />
    </ScrollStage>
  );
}
