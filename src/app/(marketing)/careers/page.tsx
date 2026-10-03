import type { Metadata } from "next";
import { block, composePage, ModuleRenderer, ScrollStage } from "@/modules";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { careersCopy } from "@/content/copy/careers";
import { FIGURE, MAIN_ID, contactBlock } from "@/content/compositions";

/**
 * `/careers` — a vertical document.
 *
 * Careers used to be a row on `/contact`: one address among three, with a
 * sentence beside it. That gave the half of the company that is people the same
 * weight as a footnote about press enquiries, and it made anyone wanting to
 * apply pick a lane before they could write a word.
 *
 * The order is the argument the page has to win, in the order a stranger asks
 * it: are you even hiring (the masthead says rarely), what do you want if not a
 * CV, what is actually open, and — because most of the time nothing is — write
 * anyway.
 *
 * `mark-field` is the same block the home page's Labs panel uses, carrying
 * different words on its plate. Two pages, one press: see `print` in its
 * config for why that is a prop rather than a second block.
 */

export const metadata: Metadata = {
  title: careersCopy.meta.title,
  description: careersCopy.meta.description,
};

const careers = composePage("careers", [
  block("header", "page-header", careersCopy.header),
  block(
    "stance",
    "figure-statement",
    { ...careersCopy.stance, figure: FIGURE },
    { anchor: "what-we-look-for" },
  ),
  block("roles", "open-roles", careersCopy.openRoles, { anchor: "roles" }),
  block("invitation", "mark-field", careersCopy.invitation),
  // `04`, not the shared default. This page hands off from its own section 03
  // to the footer by name, and a `NextCell` pointing at an "05" that follows a
  // "03" is the page miscounting itself out loud.
  contactBlock({ index: "04" }),
]);

export default function CareersPage() {
  return (
    <ScrollStage mainId={MAIN_ID} overlay={<SiteChrome mainId={MAIN_ID} />}>
      <span id="top" className="sr-only" />
      <ModuleRenderer composition={careers} />
    </ScrollStage>
  );
}
