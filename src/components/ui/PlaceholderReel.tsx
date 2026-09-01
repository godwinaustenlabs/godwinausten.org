import { Label } from "@/components/ui/Label";
import { cn } from "@/lib/utils";

/**
 * A placeholder reel — a loop that stands in for footage until it exists.
 *
 * ## Why this is not a video file
 *
 * There is no encoder on the build machine and none npm can pin, so a real
 * `.mp4` is not something this repo can generate. Committing a stock clip would
 * put someone else's footage on the page and make a licensing question out of a
 * placeholder.
 *
 * So the placeholder is drawn: the orbit motif turning, a light sweep crossing
 * the frame, a progress bar filling, captions cycling in step. It loops, it
 * moves, and it is unmistakably ours. An empty black box behind a label — which
 * is what was here — reads as a broken player.
 *
 * All CSS animation on a handful of elements: no JavaScript, no per-frame work,
 * and it stops dead under `prefers-reduced-motion` (see `globals.css`), leaving
 * a legible still.
 *
 * ## `playOn`
 *
 * `"always"` for a reel that is the subject of its section. `"hover"` for one
 * sitting in a card, where a permanently moving thumbnail competes with the
 * copy beside it — it holds its first frame until the pointer arrives.
 *
 * **It is a placeholder.** Add a real `src` in the copy module and the `<video>`
 * replaces this entirely; nothing else changes.
 */

/** One pass through every caption. Slow on purpose — ambience, not a demo. */
const LOOP_SECONDS = 16;

export function PlaceholderReel({
  runtime,
  captions = [],
  playOn = "always",
  className,
}: {
  runtime: string;
  /** Cycled one at a time, in step with the progress bar. */
  captions?: string[];
  playOn?: "always" | "hover";
  className?: string;
}) {
  const step = LOOP_SECONDS / Math.max(captions.length, 1);
  // Paused until the pointer arrives, resumed by the parent's `group` hover.
  const gate =
    playOn === "hover"
      ? "[animation-play-state:paused] group-hover:[animation-play-state:running]"
      : "";

  return (
    <div className={cn("relative size-full overflow-hidden bg-ink", className)}>
      {/* The orbit, turning. Same motif as the tiles, at reel scale. */}
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 [animation:reel-turn_38s_linear_infinite] bg-[length:auto_78%] bg-center bg-no-repeat opacity-60",
          gate,
        )}
        style={{ backgroundImage: "url(/assets/tiles/orbit.svg)" }}
      />

      {/* A sweep of light crossing the frame, so it never sits perfectly still. */}
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0 -left-1/3 w-1/3 [animation:reel-sweep_9s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-paper/[0.07] to-transparent",
          gate,
        )}
      />

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2.5 p-4">
        {captions.length > 0 ? (
          <div className="relative h-5">
            {captions.map((caption, i) => (
              <p
                key={caption}
                className={cn(
                  "absolute inset-x-0 bottom-0 [animation:reel-caption_var(--loop)_linear_infinite] truncate font-sans text-sm text-paper opacity-0",
                  gate,
                )}
                style={
                  {
                    "--loop": `${LOOP_SECONDS}s`,
                    animationDelay: `${i * step}s`,
                  } as React.CSSProperties
                }
              >
                <span className="me-3 font-mono text-xs text-signal">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {caption}
              </p>
            ))}
          </div>
        ) : null}

        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px flex-1 bg-paper/20">
            <span
              className={cn(
                "block h-px w-0 origin-left [animation:reel-progress_var(--loop)_linear_infinite] bg-signal",
                gate,
              )}
              style={{ "--loop": `${LOOP_SECONDS}s` } as React.CSSProperties}
            />
          </span>
          <Label tone="paper" className="shrink-0 opacity-70">
            {runtime}
          </Label>
        </div>
      </div>
    </div>
  );
}
