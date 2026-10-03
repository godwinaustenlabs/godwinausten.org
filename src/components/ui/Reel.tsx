"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PlaceholderReel } from "@/components/ui/PlaceholderReel";

/**
 * A looping clip in a cell — the one way this site plays footage inline.
 *
 * It fills its cell. The cell is the frame and the seam around it is the only
 * chrome, so `object-cover` lets real footage fill whatever shape the grid gives
 * it without being letterboxed or squashed.
 *
 * ## Why this is shared rather than one block's part
 *
 * It used to live inside `experience-feature`, which meant the home page had a
 * reel that played and `/work` and `/work/[slug]` had `<video preload="none">`
 * with nothing to start it. That branch had never run — no experience carried a
 * `src` — so the day one arrived those two pages would have shown a black
 * rectangle where a placeholder used to be, which is the exact failure the
 * placeholder exists to prevent. The same clip in the same product deserves the
 * same behaviour on every page that shows it, and the only way to keep that true
 * is for there to be one of these.
 *
 * ## Playback — a still until it is asked for, but ready before it is
 *
 * `playOn` used to describe only the drawn placeholder: real footage played
 * whenever it was on screen, on every page that showed it. Three pages showing
 * the same experience meant three pages each opening a chain of range requests
 * at a reader who had not asked to watch anything, and a moving thumbnail beside
 * a paragraph competes with the paragraph. So `playOn` governs the video too.
 *
 * - `"hover"` — the still holds and the clip starts when the pointer arrives or
 *   the frame takes focus. Leaving rewinds it, so the next pass starts at the
 *   top rather than resuming mid-shot.
 * - `"always"` — for a reel that is the subject of its section: it starts on
 *   screen and pauses off it.
 *
 * **On a touch screen a `"hover"` reel plays on visibility instead.** There is
 * no pointer to arrive, and the previous behaviour — hold the still until
 * something taps — meant a phone visitor saw a frozen frame and no indication
 * that it was a video at all.
 *
 * ## Why it is already buffered by the time you point at it
 *
 * The delay the owner reported was not the origin, it was this component: at
 * `preload="none"` the pointer arriving is when the *download starts*, so the
 * wait was a whole file fetched from cold with somebody watching a still.
 *
 * There are two observers for that reason, and they are not the same observer
 * with two thresholds:
 *
 * - **Warm** fires a long way out (`rootMargin` of a full viewport) and only
 *   flips `preload` to `"auto"`. Nothing plays; the browser simply starts
 *   pulling while the reel is still below the fold, so the bytes are there
 *   before the reader is.
 * - **In view** fires on the real thing and is what actually plays.
 *
 * A reel nobody scrolls near still costs nothing, which is the property
 * `preload="none"` was protecting and which a blanket `preload="auto"` would
 * have thrown away.
 *
 * Until a `src` arrives it runs `PlaceholderReel` — the drawn loop, never a
 * black box. A `src` that arrives and then fails to load takes the same branch:
 * since media moved to a public origin (`src/server/media.ts`) nothing checks
 * ahead of time whether the object is really there, so "the key is empty" shows
 * up here, as a load error, and the answer to it is the drawn loop rather than
 * the broken-media glyph the browser would otherwise paint.
 */
export function Reel({
  label,
  src,
  poster,
  playOn = "hover",
}: {
  /** Mono caption the placeholder shows — the reel's name. */
  label: string;
  /** Absent only when the media route has neither an object nor a stand-in. */
  src?: string;
  /**
   * The still, shown until the clip is playing.
   *
   * Painted as a layer over the video rather than passed to `poster`, for two
   * reasons. A `poster` is replaced by the first decoded frame and never comes
   * back, so a clip that has been watched once loses its thumbnail for the rest
   * of the visit; and a `poster` that 404s paints the browser's broken-image
   * glyph, where a background that 404s paints nothing and the ink ground behind
   * it is still the right colour.
   *
   * Optional. Without one a `"hover"` reel shows the video's own first frame.
   */
  poster?: string;
  /**
   * When the clip runs. `"always"` for a reel that is the subject of its
   * section; `"hover"` for one sitting in a card, where a permanently moving
   * thumbnail competes with the copy beside it.
   */
  playOn?: "always" | "hover";
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  /** True once the reel is close enough that its bytes are worth fetching. */
  const [warm, setWarm] = useState(false);
  /**
   * Whether this device can hover at all.
   *
   * `null` until measured, and the distinction matters on the first paint: a
   * touch reel plays on visibility, so guessing wrong either starts a video on a
   * desktop nobody pointed at or leaves a phone holding a frozen frame.
   */
  const [canHover, setCanHover] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);
  // The failing URL rather than a flag, so a new `src` is live again with no
  // effect to reset it — and a second failure of the same URL is still one
  // state change, not a loop.
  const [failedSrc, setFailedSrc] = useState<string>();

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const read = () => setCanHover(query.matches);
    read();
    query.addEventListener("change", read);
    return () => query.removeEventListener("change", read);
  }, []);

  /*
   * Warm the buffer a viewport early. This never plays anything — it only lets
   * the element start downloading, so the pointer does not arrive to a cold
   * fetch. See the note above the component.
   */
  useEffect(() => {
    const el = videoRef.current;
    if (!el || warm) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setWarm(true);
      },
      { rootMargin: "100% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [src, warm]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => setInView(entries.some((entry) => entry.isIntersecting)),
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [src]);

  const start = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    // A rejected `play()` is a policy decision the browser made, not a fault.
    void el
      .play()
      .then(() => setPlaying(true))
      .catch(() => {});
  }, []);

  const stop = useCallback((rewind: boolean) => {
    const el = videoRef.current;
    if (!el) return;
    el.pause();
    // Back to the top, so the still and the first frame agree next time. Not on
    // a plain scroll-away: a reader who scrolls back should find the clip where
    // they left it rather than restarted.
    if (rewind) el.currentTime = 0;
    setPlaying(false);
  }, []);

  /*
   * Visibility drives playback for everything except a hover reel on a device
   * that can actually hover.
   */
  const playsOnView = playOn === "always" || canHover === false;

  useEffect(() => {
    if (!playsOnView) return;
    if (inView) start();
    else stop(false);
  }, [inView, playsOnView, start, stop]);

  if (!src || failedSrc === src) {
    return <PlaceholderReel runtime={label} playOn={playOn} />;
  }

  return (
    <figure
      className="relative size-full bg-ink"
      {...(playsOnView
        ? {}
        : {
            onPointerEnter: start,
            onPointerLeave: () => stop(true),
            onFocus: start,
            onBlur: () => stop(true),
          })}
    >
      {/*
        `object-contain`, so the frame is never cropped.

        `object-cover` fills whatever shape the grid gives the cell, and on the
        two cells that are not 16:9 — the filmstrip's case-study card and the VSL
        panel at `md` — that meant slicing the sides or the top off the picture.
        Contained, the video is always displayed at its own ratio on every page,
        and the ink ground behind it absorbs whatever is left over: a letterbox
        on an ink panel is invisible, and a cropped frame never is.
      */}
      <video
        ref={videoRef}
        src={src}
        muted
        loop
        playsInline
        /*
          `"none"` until the reel is approaching, then `"auto"`.

          This is the whole of the hover latency fix. `"none"` forever means the
          pointer arriving is when the download begins; `"auto"` from the start
          means every reel on the page pulls its file whether or not anyone
          scrolls to it. Warming on approach is neither.
        */
        preload={warm ? "auto" : "none"}
        onError={() => setFailedSrc(src)}
        className="size-full object-contain"
      />

      {/*
        The still. `contain` and centred, matching the video under it exactly, so
        the handover at the moment playback starts is the same picture in the
        same place rather than a jump.

        It fades rather than cuts: a still swapping to a first frame in one step
        reads as a glitch, and 240ms is long enough to read as the clip coming up
        and short enough not to be a transition anyone waits through. Under
        reduced motion `globals.css` neutralises it and the swap is instant,
        which is correct — there is nothing moving to be sensitive to yet.
      */}
      {poster ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-contain bg-center bg-no-repeat transition-opacity duration-[240ms] ease-out-expo"
          style={{ backgroundImage: `url(${poster})`, opacity: playing ? 0 : 1 }}
        />
      ) : null}
    </figure>
  );
}
