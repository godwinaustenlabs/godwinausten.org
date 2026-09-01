import type { Metadata } from "next";
import { block, composePage, ModuleRenderer, ScrollStage } from "@/modules";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { contactCopy } from "@/content/copy/contact";
import { MAIN_ID, contactBlock } from "@/content/compositions";

/**
 * `/contact` — a vertical document.
 *
 * The page exists because "email us" is not an answer to "should I email you?".
 * It sets expectations instead: what to put in the message, what happens after
 * you send it, and how long it takes. The footer block at the bottom carries
 * the addresses themselves, as it does on every route.
 */

export const metadata: Metadata = {
  title: contactCopy.meta.title,
  description: contactCopy.meta.description,
};

const contact = composePage("contact", [
  block("header", "page-header", contactCopy.header),
  block("expectations", "prose-sections", contactCopy.expectations, { anchor: "before" }),
  block("channels", "services-rows", contactCopy.channels, { anchor: "channels" }),
  contactBlock(),
]);

export default function ContactPage() {
  return (
    <ScrollStage mainId={MAIN_ID} overlay={<SiteChrome mainId={MAIN_ID} />}>
      <span id="top" className="sr-only" />
      <ModuleRenderer composition={contact} />
    </ScrollStage>
  );
}
