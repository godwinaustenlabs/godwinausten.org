import { block, composePage, ModuleRenderer, ScrollStage } from "@/modules";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { homeCopy } from "@/content/copy/home";
import { FIGURE, MAIN_ID, contactBlock } from "@/content/compositions";

/**
 * The home page: the funnel.
 *
 * A composition and nothing else — no layout markup, no copy. Each section is a
 * block, every string comes from `src/content/copy/`, and the order below is
 * the only thing that knows what follows what.
 *
 * ## The order is the argument
 *
 * hook → proof → mechanism → **the ask** → the long version → contact.
 *
 * The opt-in is 03 and the video is 04, not the other way round. By the ask the
 * reader has seen one thing we built and how we build it; what we then request
 * is one field with no call attached.
 *
 * This is the only route that runs as a horizontal filmstrip. `/work`,
 * `/about` and `/contact` are ordinary vertical documents.
 */

const home = composePage("home", [
  block("hero", "hero-scribble", { ...homeCopy.hero, figure: FIGURE }),
  block("experience", "experience-feature", homeCopy.experience, { anchor: "experience" }),
  block(
    "services",
    "services-rows",
    { ...homeCopy.services, lattice: true },
    { anchor: "expertise" },
  ),
  block("magnet", "lead-magnet", { ...homeCopy.magnet, anchor: "playbook" }),
  block("vsl", "vsl-panel", homeCopy.vsl, { anchor: "watch" }),
  contactBlock(),
]);

export default function HomePage() {
  return (
    <ScrollStage filmstrip mainId={MAIN_ID} overlay={<SiteChrome mainId={MAIN_ID} />}>
      {/* Anchor for the wordmark's "back to top" link. */}
      <span id="top" className="sr-only" />
      <ModuleRenderer composition={home} />
    </ScrollStage>
  );
}
