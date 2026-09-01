/**
 * The scroll engine.
 *
 * One module owns every scroll-linked effect on the site, for two reasons:
 *
 *  1. **One rAF loop, one layout read.** N blocks each running their own
 *     `useScroll` means N subscriptions and N `getBoundingClientRect()` calls
 *     per frame. Here it is one loop that measures a batch and writes a batch,
 *     so reads and writes never interleave and the browser never has to flush
 *     layout mid-frame.
 *  2. **Two axes, one contract.** On a wide desktop the page is a horizontal
 *     filmstrip; everywhere else it is a normal vertical document. Blocks must
 *     not know which. The engine resolves the axis and publishes the same
 *     `--block-progress` custom property either way.
 *
 * Nothing here imports React. `ScrollStage` and `BlockFrame` are the React
 * bindings; this file is the mechanism, and is unit-testable without a DOM
 * renderer.
 */

/**
 * Below this viewport width the filmstrip is off and the page is a plain
 * vertical document. Mirrors `--breakpoint-wide` in src/styles/globals.css.
 */
export const STRIP_MIN_WIDTH = 1200;

export type ScrollMode = "flow" | "strip";

/**
 * How hard the transform chases the true scroll position each frame.
 * Lower is smoother and laggier. 0.12 lands just short of "floaty" at 60fps and
 * is scaled by frame time below so a 120Hz display does not feel twice as
 * snappy.
 */
const LERP = 0.12;

/** Stop the rAF loop once the transform is within this many px of its target. */
const SETTLE_EPSILON = 0.05;

interface Tracked {
  el: HTMLElement;
  /** Last progress written, so we skip redundant style writes. */
  last: number;
  /** Last lead written, same reason. */
  lastLead: number;
}

/**
 * How far an element has travelled past the viewport's leading edge, in px,
 * clamped so it can never exceed the element's own extent.
 *
 * This is the pinning primitive. Offsetting a child by this amount keeps it
 * parked at the leading edge for exactly as long as its section is on screen,
 * and lets it go when the section runs out — the behaviour `position: sticky`
 * would give if the filmstrip were a real scrollport rather than a transform.
 */
export function leadOffset(
  rect: { top: number; left: number; width: number; height: number },
  viewport: { width: number; height: number },
  axis: "x" | "y",
): number {
  const [start, extent, span] =
    axis === "y"
      ? [rect.top, rect.height, viewport.height]
      : [rect.left, rect.width, viewport.width];

  return clamp(-start, 0, Math.max(0, extent - span));
}

/**
 * Progress of `rect` through the viewport along `axis`, as 0→1.
 *
 * 0 = the element's leading edge is just about to enter,
 * 1 = its trailing edge has just left.
 * This is the same "start end → end start" window Motion's `useScroll` uses,
 * which is what makes the vertical behaviour identical to what BlockFrame had
 * before the engine existed.
 */
export function progressThroughViewport(
  rect: { top: number; bottom: number; left: number; right: number },
  viewport: { width: number; height: number },
  axis: "x" | "y",
): number {
  const [start, end, extent] =
    axis === "y"
      ? [rect.top, rect.bottom, viewport.height]
      : [rect.left, rect.right, viewport.width];

  const span = end - start + extent;
  if (span <= 0) return 0;

  const travelled = extent - start;
  return clamp(travelled / span, 0, 1);
}

export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

/**
 * Resolve the scroll mode for a viewport.
 *
 * Reduced motion forces `flow` even on a wide desktop. That is the accessibility
 * requirement from the build brief and CLAUDE.md §3.4, and it is enforced here
 * rather than in CSS so the JS transform is never installed at all.
 */
export function resolveMode(
  width: number,
  prefersReducedMotion: boolean,
  filmstrip = true,
): ScrollMode {
  // `filmstrip` is the page's own opt-in. Only the home page is a filmstrip;
  // the sub-routes are ordinary vertical documents at every width, because a
  // page with real depth of content wants to be read, not travelled through.
  if (!filmstrip) return "flow";
  if (prefersReducedMotion) return "flow";
  return width >= STRIP_MIN_WIDTH ? "strip" : "flow";
}

export interface StripGeometry {
  /** Total horizontal distance the track has to travel. */
  distance: number;
  /** The document height that produces exactly that much scrolling. */
  scrollHeight: number;
}

/**
 * Map the track's overflow onto vertical page height.
 *
 * The filmstrip deliberately does **not** hijack the wheel. It makes the
 * document genuinely tall enough that the browser's own scrollbar, trackpad
 * momentum, Page Down, spacebar, and find-in-page all keep working — we only
 * translate the result sideways. That is what "native, not janky" means here,
 * and it is why this needs no scroll-jacking library.
 */
export function stripGeometry(
  trackWidth: number,
  viewportWidth: number,
  viewportHeight: number,
): StripGeometry {
  const distance = Math.max(0, trackWidth - viewportWidth);
  // The browser's maximum scrollY is `documentHeight - viewportHeight`, so the
  // document has to be one *viewport height* taller than the distance — not one
  // viewport width. Getting this wrong leaves a dead zone at the end of the page
  // where scrolling does nothing because the track has already hit its clamp.
  return { distance, scrollHeight: distance + viewportHeight };
}

export interface EngineHandle {
  /** Start observing an element; returns an unsubscribe. */
  track(el: HTMLElement): () => void;
  /** Re-measure after a resize or a font swap. */
  measure(): void;
  /** Current mode. */
  mode(): ScrollMode;
  /** Window scrollY that puts `el`'s leading edge at the viewport's leading edge. */
  offsetOf(el: HTMLElement): number;
  /** Tear everything down and restore the document. */
  destroy(): void;
}

export interface EngineOptions {
  /**
   * The element that clips the track. Only used for measurement — the mode flag
   * goes on `<html>` (see `applyMode`).
   */
  stage: HTMLElement;
  /** The flex row of panels that slides. */
  track: HTMLElement;
  /** The element whose height fakes the document length in strip mode. */
  spacer: HTMLElement;
  /** Whether this page is allowed to run as a filmstrip at all. */
  filmstrip: boolean;
  /** Injectable so the engine can be driven by a test's jsdom window. */
  window: Window & typeof globalThis;
}

/**
 * Build the engine. Call once per stage, from an effect.
 *
 * The returned handle is the only way to interact with it — there is no module
 * level singleton, so two stages (or two tests) never fight over one rAF loop.
 */
export function createScrollEngine(options: EngineOptions): EngineHandle {
  const { track, spacer, filmstrip, window: win } = options;
  const doc = win.document;
  /*
   * The mode flag lives on `<html>`, not on the stage.
   *
   * The site header is a *sibling* of the stage, not a descendant — it has to
   * be, so it can float above every panel — and it still needs to switch
   * between a solid sticky bar and a transparent blended overlay. Flagging the
   * root is the only place both the stage and its siblings can see.
   */
  const flag = doc.documentElement;

  const tracked = new Set<Tracked>();
  const reduceQuery = win.matchMedia("(prefers-reduced-motion: reduce)");

  let mode: ScrollMode = "flow";
  let geometry: StripGeometry = { distance: 0, scrollHeight: 0 };
  let viewport = { width: 0, height: 0 };

  /** Where the track actually is, in px. Lerps toward `target`. */
  let current = 0;
  let target = 0;
  let frame = 0;
  let lastTime = 0;
  /** Set while a jump is in flight so the lerp does not smooth an anchor jump. */
  let snapNext = false;

  function applyMode(next: ScrollMode) {
    if (next === mode) return;
    mode = next;
    flag.dataset.scrollMode = next;

    if (next === "flow") {
      // Hand the document back to the browser exactly as it was.
      track.style.transform = "";
      spacer.style.height = "";
      current = 0;
      target = 0;
    }
  }

  function measure() {
    viewport = { width: win.innerWidth, height: win.innerHeight };
    applyMode(resolveMode(viewport.width, reduceQuery.matches, filmstrip));

    if (mode === "strip") {
      geometry = stripGeometry(track.scrollWidth, viewport.width, viewport.height);
      spacer.style.height = `${geometry.scrollHeight}px`;
      // A resize can leave us scrolled past the new end; clamp rather than
      // letting the track fly off.
      target = clamp(win.scrollY, 0, geometry.distance);
      snapNext = true;
    }

    request();
  }

  function readTarget() {
    if (mode !== "strip") return;
    target = clamp(win.scrollY, 0, geometry.distance);
  }

  /**
   * One frame: advance the lerp, write the transform, then publish progress for
   * every tracked block. Reads are all done inside `publish` in one pass.
   */
  function tick(time: number) {
    frame = 0;
    const delta = lastTime ? Math.min(time - lastTime, 64) : 16.7;
    lastTime = time;

    let settled = true;

    if (mode === "strip") {
      if (snapNext) {
        current = target;
        snapNext = false;
      } else {
        // Frame-rate independent lerp: the same visual smoothing at 60 and 144Hz.
        const alpha = 1 - Math.pow(1 - LERP, delta / 16.7);
        current += (target - current) * alpha;
      }

      if (Math.abs(target - current) < SETTLE_EPSILON) {
        current = target;
      } else {
        settled = false;
      }

      track.style.transform = `translate3d(${-current}px, 0, 0)`;
    }

    publish();

    // Keep ticking while the lerp is still catching up; otherwise go quiet and
    // wait for the next scroll event. An idle page burns no frames.
    if (!settled) request();
    else lastTime = 0;
  }

  function publish() {
    const axis: "x" | "y" = mode === "strip" ? "x" : "y";
    for (const entry of tracked) {
      // One rect read per element per frame, feeding both values.
      const rect = entry.el.getBoundingClientRect();

      const p = progressThroughViewport(rect, viewport, axis);
      // Two decimals is finer than any effect can show and stops us writing a
      // style on every single frame of a slow scroll.
      const rounded = Math.round(p * 100) / 100;
      if (rounded !== entry.last) {
        entry.last = rounded;
        entry.el.style.setProperty("--block-progress", String(rounded));
      }

      const lead = Math.round(leadOffset(rect, viewport, axis));
      if (lead !== entry.lastLead) {
        entry.lastLead = lead;
        entry.el.style.setProperty("--block-lead", `${lead}px`);
      }
    }
  }

  function request() {
    if (frame) return;
    frame = win.requestAnimationFrame(tick);
  }

  function onScroll() {
    readTarget();
    request();
  }

  const resizeObserver = new win.ResizeObserver(() => measure());
  resizeObserver.observe(track);

  win.addEventListener("scroll", onScroll, { passive: true });
  win.addEventListener("resize", measure);
  reduceQuery.addEventListener("change", measure);

  /**
   * Keyboard and screen-reader focus must move the strip.
   *
   * DOM order is the reading order, but visual order is horizontal, so tabbing
   * into a panel that is off-screen would otherwise scroll nothing (the panel is
   * inside an element with no scrollable overflow). We translate the focused
   * element's position back into a window scroll.
   */
  function onFocusIn(event: FocusEvent) {
    if (mode !== "strip") return;
    const el = event.target;
    if (!(el instanceof win.HTMLElement) || !track.contains(el)) return;

    const rect = el.getBoundingClientRect();
    const margin = viewport.width * 0.15;
    if (rect.left >= margin && rect.right <= viewport.width - margin) return;

    win.scrollTo({
      top: clamp(win.scrollY + rect.left - margin, 0, geometry.distance),
      behavior: "smooth",
    });
  }

  doc.addEventListener("focusin", onFocusIn);

  // Publish the starting mode before measuring so `strip:` styles have
  // something to match on from the very first frame.
  flag.dataset.scrollMode = "flow";
  measure();

  return {
    track(el) {
      const entry: Tracked = { el, last: -1, lastLead: -1 };
      tracked.add(entry);
      request();
      return () => {
        tracked.delete(entry);
        el.style.removeProperty("--block-progress");
        el.style.removeProperty("--block-lead");
      };
    },
    measure,
    mode: () => mode,
    offsetOf(el) {
      if (mode !== "strip") {
        return win.scrollY + el.getBoundingClientRect().top;
      }
      return clamp(current + el.getBoundingClientRect().left, 0, geometry.distance);
    },
    destroy() {
      resizeObserver.disconnect();
      win.removeEventListener("scroll", onScroll);
      win.removeEventListener("resize", measure);
      reduceQuery.removeEventListener("change", measure);
      doc.removeEventListener("focusin", onFocusIn);
      if (frame) win.cancelAnimationFrame(frame);
      applyMode("flow");
      for (const entry of tracked) {
        entry.el.style.removeProperty("--block-progress");
        entry.el.style.removeProperty("--block-lead");
      }
      tracked.clear();
    },
  };
}
