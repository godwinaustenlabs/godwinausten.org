"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Label } from "@/components/ui/Label";
import { PlaceholderReel } from "@/components/ui/PlaceholderReel";
import { cn } from "@/lib/utils";

/**
 * The film's slot before there is a film: a banner that says so when pressed.
 *
 * ## Why this is not `FilmFrame`
 *
 * `FilmFrame` already has a no-film path, and it is the right one for *its*
 * problem — an object that should be at the key and is not, discovered at load.
 * That path is a working transport over a drawn loop, because a player whose
 * controls are dead is a player nobody has tested.
 *
 * This is a different claim. The cut is not late, it does not exist yet, and the
 * owner would rather say so than hand a visitor a transport that scrubs a
 * placeholder. So the frame is deliberately inert: one affordance, one sentence
 * when it is pressed, and no suggestion that pressing harder will produce a
 * film. Dressing it up as a player that happens to be empty is the version that
 * wastes the visitor's click.
 *
 * It reuses `PlaceholderReel` as the backdrop rather than shipping a JPEG. The
 * reel is drawn in CSS, it is already on the page elsewhere, it stops dead under
 * `prefers-reduced-motion`, and it cannot be the wrong size or fail to load — a
 * stand-in thumbnail that 404s is worse than the thing it stands in for.
 *
 * ## Putting the film back
 *
 * Drop `comingSoon` from the block's props and `vsl-panel` renders `FilmFrame`
 * again. Nothing here needs deleting, and nothing about the real player was
 * touched to add this.
 */
export function FilmComingSoon({
  label,
  openLabel = "Watch it",
  heading,
  body,
  className,
}: {
  /** Mono caption on the frame, matching `FilmFrame`'s. */
  label: string;
  /** The affordance's text. */
  openLabel?: string;
  heading: string;
  body: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  /**
   * Escape closes it, and the page stops scrolling behind it.
   *
   * Both only while it is open, and both undone on close — a dialog that leaves
   * `overflow: hidden` on the body after it goes is a page that looks frozen.
   */
  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, close]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className={cn(
          "group relative block h-full w-full cursor-pointer overflow-hidden bg-ink text-left",
          className,
        )}
      >
        <PlaceholderReel
          runtime={label}
          captions={["the workflow we mapped", "what we built", "what it costs to run"]}
          playOn="always"
          className="absolute inset-0"
        />

        {/*
          A scrim under the affordance, not over the whole frame.

          The reel it sits on is light in places and dark in others as the sweep
          crosses, so a label with no ground behind it is legible for two thirds
          of the loop and not the rest.
        */}
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink/35 transition-colors group-hover:bg-ink/50">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-paper/50 bg-ink/40 backdrop-blur-sm transition-transform group-hover:scale-105">
            {/* A triangle, drawn rather than imported: one glyph is not worth an icon set. */}
            <svg viewBox="0 0 24 24" aria-hidden="true" className="ml-1 h-5 w-5 fill-paper">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          <Label tone="paper" className="opacity-90">
            {openLabel}
          </Label>
        </span>
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={heading}
            // The backdrop closes it. A modal with one piece of information and
            // no decision in it should not insist on the button being found.
            onClick={close}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/80 p-6 backdrop-blur-sm"
          >
            <div
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-md border border-paper/15 bg-ink p-8 text-center"
            >
              <Label tone="paper" className="opacity-50">
                {label}
              </Label>
              <h3 className="mt-4 font-display text-[clamp(1.4rem,2.6vw,1.9rem)] leading-tight font-bold text-paper">
                {heading}
              </h3>
              <p className="mt-3 font-sans text-sm leading-relaxed text-paper/70">{body}</p>
              <button
                type="button"
                onClick={close}
                autoFocus
                className="mt-7 cursor-pointer border border-paper/30 px-6 py-2.5 font-mono text-[0.7rem] tracking-[0.18em] text-paper uppercase transition-colors hover:border-paper/60 hover:bg-paper/5"
              >
                Close
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
