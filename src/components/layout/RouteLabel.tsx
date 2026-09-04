"use client";

import { usePathname } from "next/navigation";
import { Label } from "@/components/ui/Label";

/**
 * The current route, set beside the wordmark.
 *
 * A fixed bar carrying only a wordmark says which *site* you are on and nothing
 * about where in it — and this site's sub-routes look alike by design, all of
 * them the same panels in the same frame. `/work` next to the signature is the
 * cheapest possible answer to "where am I", and it is the convention the
 * reference uses too.
 *
 * Client-only for one reason: `usePathname`. `SiteChrome` stays a server
 * component and this is the single leaf that needs the router, which keeps the
 * chrome's cost to the few bytes this file compiles to rather than shipping the
 * whole bar to the browser.
 *
 * Nothing is drawn on the home page. "/" beside the wordmark is noise — the
 * wordmark already *is* the home link, and a label that says you are nowhere in
 * particular is worse than no label.
 */
export function RouteLabel() {
  const pathname = usePathname();
  if (!pathname || pathname === "/") return null;

  // Only the first segment. `/work/the-picasso-experience` is still `/work` —
  // the bar names the section, and a slug in a 11px mono label is unreadable
  // and, on a case-study page, already the headline underneath it.
  const [, segment] = pathname.split("/");
  if (!segment) return null;

  return (
    <Label tone="ink" className="opacity-35">
      /{segment}
    </Label>
  );
}
