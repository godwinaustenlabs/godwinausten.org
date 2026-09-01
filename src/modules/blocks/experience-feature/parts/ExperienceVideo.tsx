"use client";

import { useEffect, useRef, useState } from "react";
import { PlaceholderReel } from "@/components/ui/PlaceholderReel";

/**
 * The experience's clip.
 *
 * Fills its cell — the cell is the frame, and the seam around it is the only
 * chrome. `object-cover` means real footage fills whatever shape the grid gives
 * it without being letterboxed or squashed.
 *
 * Until a `src` arrives it runs a placeholder reel that **holds its first frame
 * until the pointer arrives**. A thumbnail looping permanently beside a
 * paragraph competes with it for attention; one that starts when you look at it
 * is an invitation. The card is the `group`, so hovering anywhere on it starts
 * the reel.
 *
 * Real footage gets the same treatment: muted, looping, and only decoding while
 * it is on screen.
 */
export function ExperienceVideo({ label, src }: { label: string; src?: string }) {
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
    // Only decode what is on screen; a loop running behind other panels is a
    // frame budget this page cannot spare.
    if (inView) void el.play().catch(() => {});
    else el.pause();
  }, [inView]);

  if (!src) {
    return <PlaceholderReel runtime={label} playOn="hover" />;
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
