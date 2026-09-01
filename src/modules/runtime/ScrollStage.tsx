"use client";

import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from "react";
import { createScrollEngine, type EngineHandle, type ScrollMode } from "./scroll-engine";

interface StageApi {
  register: (el: HTMLElement) => () => void;
  scrollToId: (id: string) => void;
  mode: () => ScrollMode;
}

const StageContext = createContext<StageApi | null>(null);

/**
 * Consumed by `BlockFrame` so every block gets scroll progress published to it
 * without knowing whether the page is scrolling sideways or down. Returns null
 * outside a stage, which is the correct answer for a route that is a plain
 * vertical document.
 */
export function useScrollStage(): StageApi | null {
  return useContext(StageContext);
}

/**
 * Turns a vertical composition into a horizontal filmstrip on wide screens.
 *
 * The structure is three elements:
 *
 *   stage    position: fixed, one viewport tall, clips the track
 *     track  a flex row of panels, translated sideways
 *   spacer   an empty div whose height makes the document long enough to
 *            produce exactly as much scrolling as the track needs
 *
 * Below `STRIP_MIN_WIDTH`, or under `prefers-reduced-motion`, none of that
 * applies: the stage is `static`, the track is a normal block stack, the spacer
 * has no height, and the page is an ordinary vertical document. Every one of
 * those switches is a CSS `strip:` variant keyed off `data-scroll-mode`, which
 * the engine sets on `<html>` — so the site header, which is a sibling rather
 * than a child of the stage, switches with it. The fallback is what renders on
 * the server, so there is no layout flash.
 *
 * DOM order is always the reading order — the horizontal arrangement is purely
 * visual, which is what keeps tab order, find-in-page, and screen readers
 * correct.
 *
 * `overlay` is for chrome that floats above every panel — the site header. It
 * renders outside the track (so it does not slide) but *inside* the stage's
 * context, which is the part that matters: a nav link has to be able to reach
 * `scrollToId`. Rendered as a sibling of the stage instead, its anchors would
 * silently fall back to native `href="#…"` navigation, which scrolls nothing
 * because the target lives inside a `position: fixed` track.
 *
 * The stage renders the `<main>` landmark itself so the overlay lands *before*
 * it in the DOM. That ordering is what makes a skip link work: `#main` has to
 * name something the visitor has not already passed.
 */
export function ScrollStage({
  overlay,
  mainId,
  filmstrip = false,
  children,
}: {
  overlay?: ReactNode;
  /** DOM id for the `<main>` landmark the stage renders. Skip links target it. */
  mainId: string;
  /**
   * Opt in to the horizontal filmstrip on wide desktops. Off by default: only
   * the home page is a filmstrip. A sub-route with real depth of content wants
   * to be read at whatever pace the reader chooses, and translating that into
   * horizontal travel makes it harder, not more interesting.
   *
   * Every page still uses the stage — it owns the `<main>` landmark, anchor
   * conversion, and `--block-progress` for parallax, all of which a vertical
   * page needs too.
   */
  filmstrip?: boolean;
  children: ReactNode;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<EngineHandle | null>(null);
  /** Blocks that mounted before the engine existed. Replayed on init. */
  const pendingRef = useRef(new Set<HTMLElement>());

  useEffect(() => {
    const stage = stageRef.current;
    const track = trackRef.current;
    const spacer = spacerRef.current;
    if (!stage || !track || !spacer) return;

    const engine = createScrollEngine({ stage, track, spacer, filmstrip, window });
    engineRef.current = engine;

    // Children mount before this effect runs, so anything that tried to
    // register early is waiting here.
    const unsubscribes: Array<() => void> = [...pendingRef.current].map((el) => engine.track(el));
    pendingRef.current.clear();

    // Web fonts land after hydration and change how wide the panels are.
    document.fonts?.ready.then(() => engine.measure()).catch(() => {});

    /*
     * Honour a hash the page was opened with.
     *
     * The browser's own fragment scrolling has already run and done nothing —
     * in filmstrip mode the target is inside a fixed track. This covers both a
     * pasted deep link and arriving from another route via `/#contact`, which
     * is why it lives here rather than in the link component: by the time the
     * new page mounts, the link that started the navigation is long gone.
     */
    const hash = window.location.hash.slice(1);
    if (hash) {
      const settle = requestAnimationFrame(() => {
        const target = document.getElementById(hash);
        if (!target) return;
        window.scrollTo({ top: engine.offsetOf(target), behavior: "auto" });
      });
      unsubscribes.push(() => cancelAnimationFrame(settle));
    }

    return () => {
      for (const off of unsubscribes) off();
      engine.destroy();
      engineRef.current = null;
    };
  }, [filmstrip]);

  const register = useCallback((el: HTMLElement) => {
    const engine = engineRef.current;
    if (engine) return engine.track(el);

    pendingRef.current.add(el);
    return () => pendingRef.current.delete(el);
  }, []);

  /**
   * Anchor navigation. In flow mode this is just `scrollIntoView`; in strip mode
   * the target's horizontal offset has to be converted back into the window
   * scroll position that produces it.
   */
  const scrollToId = useCallback((id: string) => {
    const target = document.getElementById(id);
    const engine = engineRef.current;
    if (!target) return;

    if (!engine || engine.mode() === "flow") {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    window.scrollTo({ top: engine.offsetOf(target), behavior: "smooth" });
  }, []);

  const mode = useCallback(() => engineRef.current?.mode() ?? "flow", []);

  return (
    <StageContext.Provider value={{ register, scrollToId, mode }}>
      {overlay}
      {/* `tabIndex={-1}` so the skip link actually moves focus here, not just
          the scroll position. */}
      <main id={mainId} tabIndex={-1} className="outline-none">
        <div
          ref={stageRef}
          data-scroll-stage=""
          // The chrome is fixed in both modes, so the stage reserves it once
          // here and no panel has to know the bars exist.
          className="pt-[var(--chrome-top)] pb-[var(--chrome-bottom)] strip:fixed strip:inset-0 strip:h-[100svh] strip:overflow-hidden strip:pt-[var(--chrome-top)] strip:pb-[var(--chrome-bottom)]"
        >
          <div
            ref={trackRef}
            className="strip:flex strip:h-full strip:w-max strip:flex-row strip:items-stretch strip:will-change-transform"
          >
            {children}
          </div>
        </div>
        {/* Only ever has height in strip mode; the engine owns that height. */}
        <div ref={spacerRef} aria-hidden="true" />
      </main>
    </StageContext.Provider>
  );
}
