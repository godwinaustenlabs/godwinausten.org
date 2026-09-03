import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { block, composePage, ModuleRenderer, ScrollStage } from "@/modules";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { experienceBySlug, experiences } from "@/content/work/experiences";
import { mediaSrc } from "@/server/media";
import { MAIN_ID, contactBlock } from "@/content/compositions";

/**
 * `/work/[slug]` — one experience, in full.
 *
 * Every route on this site is a composition, and this one is no different: the
 * blocks are the same ones the other pages use, given content from
 * `src/content/work/experiences.ts`.
 *
 * Statically generated from that module, so adding an experience is a content
 * change and nothing else — no route to add, no page to write.
 */

export function generateStaticParams() {
  return experiences.map((experience) => ({ slug: experience.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const experience = experienceBySlug(slug);
  if (!experience) return {};

  return {
    title: experience.name,
    description: experience.summary,
  };
}

export default async function ExperiencePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const experience = experienceBySlug(slug);
  if (!experience) notFound();

  const { detail } = experience;
  // The reel resolves from the experience's own media id, same as `/work` and
  // the home page. One entry in `experiences.ts`, one file in the bucket or in
  // `public/`, three pages showing it.
  const reel = await mediaSrc(experience.media);

  const page = composePage(`work/${experience.slug}`, [
    block("header", "page-header", {
      eyebrow: `Experience ${experience.index}`,
      headline: detail.headline,
      lead: detail.lead,
      meta: detail.meta,
      reel: { runtime: experience.runtime, ...(reel ? { src: reel } : {}) },
    }),
    block("build", "prose-sections", detail.build, { anchor: "how" }),
    block("closing", "about-statement", detail.closing),
    contactBlock(),
  ]);

  return (
    <ScrollStage mainId={MAIN_ID} overlay={<SiteChrome mainId={MAIN_ID} />}>
      <span id="top" className="sr-only" />
      <ModuleRenderer composition={page} />
    </ScrollStage>
  );
}
