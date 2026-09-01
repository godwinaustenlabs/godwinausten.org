"use client";

import { useCallback, type ReactNode } from "react";
import { useScrollStage } from "./ScrollStage";
import { useRouteTransition } from "./RouteTransition";

/**
 * The one link component the site uses.
 *
 * It routes a click to whichever mechanism the destination needs:
 *
 * | `href`            | What happens                                        |
 * | ----------------- | --------------------------------------------------- |
 * | `#work`           | the stage scrolls to that section on this page       |
 * | `/work`           | the fold/unfold transition, then a route change      |
 * | `/#contact`       | transition to `/`, then the stage finds the anchor   |
 * | `mailto:` / `http`| left entirely alone                                  |
 *
 * ## Why a plain `<a>` is not enough
 *
 * Two reasons, and each is why one of the two mechanisms exists:
 *
 * - **In-page anchors.** In filmstrip mode the target lives inside a
 *   `position: fixed` track, so there is nothing for the browser's own anchor
 *   scrolling to scroll. The stage converts the target's horizontal offset back
 *   into a window scroll position.
 * - **Route changes.** A bare navigation is a hard cut. The transition needs to
 *   cover the viewport *before* the router commits, which means owning the
 *   click.
 *
 * ## Why it is still a real `<a href>`
 *
 * Middle-click, ⌘-click, "copy link address", crawlers, and a JavaScript
 * failure all keep working, because every branch below starts from a genuine
 * anchor element and only calls `preventDefault()` once it is sure it can do
 * something better. With no JS at all, every one of these is an ordinary link.
 */
export function SiteLink({
  href,
  children,
  className,
  onNavigate,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  onNavigate?: () => void;
}) {
  const stage = useScrollStage();
  const transition = useRouteTransition();

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      onNavigate?.();

      // Let the browser handle anything that is not a plain left click:
      // new tab, new window, download, and so on.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
        return;
      }

      // Off-site and protocol links are none of our business.
      if (!href.startsWith("#") && !href.startsWith("/")) return;

      if (href.startsWith("#")) {
        if (!stage) return;
        event.preventDefault();
        stage.scrollToId(href.slice(1));
        // Keep the URL honest so the link stays shareable and Back works.
        history.replaceState(null, "", href);
        return;
      }

      const [path, fragment] = href.split("#");
      const samePage = (path || "/") === window.location.pathname;

      if (samePage) {
        // A route link pointing at the page we are already on is an anchor.
        if (!fragment || !stage) return;
        event.preventDefault();
        stage.scrollToId(fragment);
        history.replaceState(null, "", `#${fragment}`);
        return;
      }

      if (!transition) return;
      event.preventDefault();
      transition.navigate(href);
    },
    [href, stage, transition, onNavigate],
  );

  return (
    <a href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
