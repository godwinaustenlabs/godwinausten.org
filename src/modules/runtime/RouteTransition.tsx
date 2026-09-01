"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LOADER_COVER_MS,
  LOADER_REVEAL_MS,
  SiteLoader,
  type LoaderPhase,
} from "@/components/layout/SiteLoader";

/**
 * Loading and navigation, as one gesture.
 *
 * The curtain from the live godwinausten.org: a panel carrying the logomark
 * that **drops down** to cover and **drops up** to reveal. It runs on first
 * load — mark draws, curtain lifts — and again on every route change, with the
 * router called while the page is hidden.
 *
 * ## Why the timing is owned here
 *
 * `AnimatePresence` keyed on the pathname does not work in the App Router: the
 * outgoing tree is unmounted as soon as navigation commits, so there is nothing
 * left to animate out. Covering first and pushing second is the only ordering
 * that hides the swap, and something has to hold the clock for it.
 *
 * The reveal is keyed off the **pathname landing**, not a timer, so a
 * back/forward navigation — which never goes through a link — still lifts the
 * curtain. Under `prefers-reduced-motion` the curtain is never shown and the
 * router is called directly.
 */

export type RoutePhase = "idle" | "leaving" | "entering";

interface RouteTransitionApi {
  navigate: (href: string) => void;
  phase: RoutePhase;
}

const RouteTransitionContext = createContext<RouteTransitionApi | null>(null);

export function useRouteTransition(): RouteTransitionApi | null {
  return useContext(RouteTransitionContext);
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function RouteTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [phase, setPhase] = useState<RoutePhase>("idle");
  /*
   * Covered from the first paint on a cold load.
   *
   * Dropping the curtain *down* on first load means showing the page and then
   * hiding it again, which is a flash rather than a transition. It starts over
   * the page, the mark draws, and it lifts. The drop-down is for navigation,
   * where there is already something on screen to cover.
   */
  const [loader, setLoader] = useState<LoaderPhase>("covering");
  /** The path we are navigating to; cleared once it has arrived. */
  const pendingRef = useRef<string | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    for (const t of timersRef.current) clearTimeout(t);
    timersRef.current = [];
  }, []);

  const after = useCallback((ms: number, fn: () => void) => {
    timersRef.current.push(setTimeout(fn, ms));
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  /**
   * First load: the curtain is already covering. Draw the mark, then lift.
   *
   * Mounted covering rather than dropped in, because on a cold load the page
   * behind it is still assembling and dropping a curtain onto a half-painted
   * page is worse than never showing it.
   *
   * Under reduced motion the curtain is hidden in CSS, so these timers run
   * against nothing visible — cheaper than branching, and it keeps the state
   * machine identical in both cases.
   */
  useEffect(() => {
    after(LOADER_COVER_MS, () => {
      setLoader("revealing");
      after(LOADER_REVEAL_MS, () => setLoader("hidden"));
    });
    // Deliberately once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Once the new pathname has rendered, lift the curtain. */
  useEffect(() => {
    if (pendingRef.current === null) return;
    if (pendingRef.current !== pathname) return;

    pendingRef.current = null;
    setPhase("entering");
    setLoader("revealing");

    after(LOADER_REVEAL_MS, () => {
      setLoader("hidden");
      setPhase("idle");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const navigate = useCallback(
    (href: string) => {
      const target = href.split("#")[0] || "/";
      const hash = href.includes("#") ? `#${href.split("#")[1]}` : "";

      // Same page: no route change to cover, so let the anchor behaviour the
      // caller already has do its job.
      if (target === pathname) return;

      if (prefersReducedMotion()) {
        router.push(href);
        return;
      }

      clearTimers();
      pendingRef.current = target;
      setPhase("leaving");
      setLoader("covering");

      // Push once the curtain has the frame. Pushing early would show the new
      // page assembling behind a half-drawn cover.
      after(LOADER_COVER_MS, () => router.push(target + hash));
    },
    [pathname, router, clearTimers, after],
  );

  const value = useMemo<RouteTransitionApi>(() => ({ navigate, phase }), [navigate, phase]);

  return (
    <RouteTransitionContext.Provider value={value}>
      <div data-route-transition={phase}>{children}</div>
      <SiteLoader phase={loader} />
    </RouteTransitionContext.Provider>
  );
}
