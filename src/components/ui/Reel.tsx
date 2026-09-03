"use client";

import { useEffect, useRef, useState } from "react";
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
 * ## Playback
 *
 * Muted, looping, and decoding **only while on screen**: a loop running behind
 * other panels is a frame budget a conversion page cannot spare, and `play()` is
 * driven by an `IntersectionObserver` rather than by hover so the clip is
 * already moving when the reader reaches it.
 *
 * `preload="none"` because nothing here is worth a byte before it is in view.
 * The observer's `play()` is what starts the fetch.
 *
 * Until a `src` arrives it runs `PlaceholderReel` — the drawn loop, never a
 * black box.
 */
export function Reel({
  label,
  src,
  playOn = "hover",
}: {
  /** Mono caption the placeholder shows — the reel's name. */
  label: string;
  /** Absent only when the media route has neither an object nor a stand-in. */
  src?: string;
  /**
   * How the *placeholder* behaves when there is no `src`. Real footage always
   * plays on visibility; this is only about the drawn stand-in, where a
   * permanently moving thumbnail beside a paragraph competes with it.
   */
  playOn?: "always" | "hover";
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);

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

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    // A rejected `play()` is a policy decision the browser made, not a fault.
    if (inView) void el.play().catch(() => {});
    else el.pause();
  }, [inView]);

  if (!src) {
    return <PlaceholderReel runtime={label} playOn={playOn} />;
  }

  return (
    <figure className="relative size-full bg-ink">
      <video
        ref={videoRef}
        src={src}
        muted
        loop
        playsInline
        preload="none"
        className="size-full object-cover"
      />
    </figure>
  );
}
