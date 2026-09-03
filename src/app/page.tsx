import { block, composePage, ModuleRenderer, ScrollStage } from "@/modules";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { homeCopy } from "@/content/copy/home";
import { FIGURE, MAIN_ID, contactBlock } from "@/content/compositions";
import { mediaSrc } from "@/server/media";
import { experienceBySlug } from "@/content/work/experiences";

/**
 * The home page: the funnel.
 *
 * A composition and nothing else — no layout markup, no copy. Each section is a
 * block, every string comes from `src/content/copy/`, and the order below is
 * the only thing that knows what follows what.
 *
 * ## The order is the argument
 *
 * hook → proof → mechanism → **the ask** → the long version → a breath → contact.
 *
 * The opt-in is 03 and the video is 04, not the other way round. By the ask the
 * reader has seen one thing we built and how we build it; what we then request
 * is one field with no call attached.
 *
 * This is the only route that runs as a horizontal filmstrip. `/work`,
 * `/about` and `/contact` are ordinary vertical documents — which is also why
 * `mark-field` appears only here: it is `stripOnly`, a pointer-driven ornament
 * that the vertical fallback simply does not render.
 */

/**
 * The composition is built per request rather than at module load, because the
 * film's `src` is a question for R2: is there an object at the VSL's key yet?
 *
 * Resolving it here keeps the block dumb. `vsl-panel` takes an optional `src`
 * and knows nothing about buckets — which is what lets the owner drop a cut
 * into `site-media` and have it appear with no deploy and no code change.
 */
async function homeComposition() {
  /*
   * The card on this panel *is* the Picasso experience, so its reel comes from
   * that record rather than from a second copy of the id sitting here. The id
   * lived in two places before — this line and (unset) on the experience — and
   * the result was a film that played on the home page and nowhere else.
   */
  const picasso = experienceBySlug("the-picasso-experience");
  const [vsl, reel] = await Promise.all([
    mediaSrc("vsl"),
    picasso ? mediaSrc(picasso.media) : undefined,
  ]);

  return composePage("home", [
    block("hero", "hero-scribble", { ...homeCopy.hero, figure: FIGURE }),
    block(
      "experience",
      "experience-feature",
      { ...homeCopy.experience, card: { ...homeCopy.experience.card, src: reel } },
      { anchor: "experience" },
    ),
    block(
      "services",
      "services-rows",
      { ...homeCopy.services, lattice: true },
      { anchor: "expertise" },
    ),
    block("magnet", "lead-magnet", { ...homeCopy.magnet, anchor: "playbook" }),
    block("vsl", "vsl-panel", { ...homeCopy.vsl, src: vsl }, { anchor: "watch" }),
    block("mark", "mark-field", homeCopy.mark, { anchor: "who" }),
    contactBlock({ index: "06" }),
  ]);
}

export default async function HomePage() {
  return (
    <ScrollStage filmstrip mainId={MAIN_ID} overlay={<SiteChrome mainId={MAIN_ID} />}>
      {/* Anchor for the wordmark's "back to top" link. */}
      <span id="top" className="sr-only" />
      <ModuleRenderer composition={await homeComposition()} />
    </ScrollStage>
  );
}
