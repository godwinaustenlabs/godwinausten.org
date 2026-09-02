"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Label } from "@/components/ui/Label";
import { PlaceholderReel } from "@/components/ui/PlaceholderReel";
import { cn } from "@/lib/utils";

/**
 * A film in its frame, and the theatre it opens into.
 *
 * ## The two states
 *
 * **In the page** it is a muted loop that starts on hover and stops when the
 * pointer leaves. Muted and loud are different promises: a thumbnail that moves
 * invites a click, a thumbnail that makes noise gets the tab closed. It holds
 * its position between hovers rather than rewinding, so a second look continues
 * rather than restarting.
 *
 * **Open** it is a dialog over a dimmed page with a real transport: play/pause,
 * back and forward five seconds, a scrubber, elapsed time, and sound — which is
 * the first point at which sound is appropriate, because by then the visitor
 * has asked for the film twice.
 *
 * Native `controls` would give most of that for free and is the right answer
 * almost everywhere. It is not the answer here: the browser's control bar is
 * the one piece of another vendor's design language on a page built out of
 * hairlines and mono labels, and there is no `back 5s` in it.
 *
 * ## Before there is a film
 *
 * `src` is absent until the owner puts an object in R2 (see
 * `src/server/media.ts`), so this has to be complete and honest with nothing to
 * play. It runs `PlaceholderReel` in both states — the drawn loop rather than a
 * black rectangle — and the theatre says plainly that the transport arrives
 * with the film. The day the bucket has the object, `src` is a string and every
 * control below is live. Nothing else changes.
 */
export function FilmFrame({
  src,
  label,
  captions = [],
  className,
  openLabel = "Play",
}: {
  /** Absent until the film is in the bucket. */
  src?: string;
  /** Mono caption on the frame — the reel's name or runtime. */
  label: string;
  /** Cycled by the placeholder, and listed under the film in the theatre. */
  captions?: string[];
  className?: string;
  openLabel?: string;
}) {
  // No `mounted` flag guarding the portal: `open` can only become true from
  // the click handler below, which cannot run during SSR. By the time there is
  // a portal to create there is certainly a `document` to create it in.
  const [open, setOpen] = useState(false);
  const inline = useRef<HTMLVideoElement>(null);

  const hoverPlay = useCallback((play: boolean) => {
    const video = inline.current;
    if (!video) return;
    if (play) {
      // Muted autoplay is allowed without a gesture; unmuted is not, and the
      // rejected promise is noise rather than a fault.
      void video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, []);

  // The inline loop is decoration. A visitor who asked for less motion gets the
  // first frame and nothing else, and the theatre still works on demand.
  useEffect(() => {
    if (!open) return;
    inline.current?.pause();
  }, [open]);

  return (
    <>
      <div
        className={cn("group relative size-full overflow-hidden bg-ink", className)}
        onPointerEnter={() => hoverPlay(true)}
        onPointerLeave={() => hoverPlay(false)}
      >
        {src ? (
          <video
            ref={inline}
            src={src}
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            className="size-full object-cover motion-reduce:[&]:![animation:none]"
          />
        ) : (
          <PlaceholderReel runtime={label} captions={captions} playOn="hover" />
        )}

        {/*
          The whole frame is the button. A small play glyph in the corner is a
          smaller target than the thing it sits on, and on a phone there is no
          hover to discover it with.
        */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute inset-0 flex items-end justify-start p-4 text-left focus-visible:outline focus-visible:-outline-offset-4 focus-visible:outline-signal"
        >
          <span className="flex items-center gap-3 bg-ink/70 px-3 py-2 backdrop-blur-sm transition-transform group-hover:-translate-y-px">
            <span
              aria-hidden="true"
              className="flex size-6 items-center justify-center rounded-full bg-signal text-[0.6rem] text-ink"
            >
              ▶
            </span>
            <Label tone="paper">{openLabel}</Label>
          </span>
        </button>
      </div>

      {open
        ? createPortal(
            <Theatre src={src} label={label} captions={captions} onClose={() => setOpen(false)} />,
            document.body,
          )
        : null}
    </>
  );
}

/** Seconds the skip controls jump. */
const SKIP = 5;

function Theatre({
  src,
  label,
  captions,
  onClose,
}: {
  src?: string;
  label: string;
  captions: string[];
  onClose: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Escape closes, and the page underneath must not scroll while a dialog is
  // over it — on the filmstrip a stray wheel event would slide the whole site
  // sideways behind the film.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    panel.current?.focus();
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const toggle = () => {
    const el = video.current;
    if (!el) return;
    if (el.paused) void el.play().catch(() => {});
    else el.pause();
  };

  const seekBy = (delta: number) => {
    const el = video.current;
    if (!el) return;
    el.currentTime = Math.min(Math.max(el.currentTime + delta, 0), el.duration || 0);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10"
    >
      {/* The dim. A button so a pointer *or* a keyboard can dismiss by leaving,
          and `aria-hidden` because Escape and the close button already say this
          in the accessibility tree. */}
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-ink/90 backdrop-blur-sm"
      />

      <div
        ref={panel}
        tabIndex={-1}
        /*
          Capped to the viewport and laid out as media-then-transport, rather
          than sizing the media by aspect ratio alone: a 16:9 box as wide as a
          desktop window is taller than the window, which pushed the controls
          off the bottom of the screen. The film takes whatever is left after
          the transport has its row, and `object-contain` letterboxes it.
        */
        className="relative flex h-[calc(100dvh-5rem)] w-full max-w-[min(90rem,100%)] flex-col gap-3 outline-none"
      >
        {/*
          A definite height on the panel, not a maximum. `flex-1` distributes
          *free space*, and a column whose own height is decided by its content
          has none to give — the film collapsed to nothing and left the transport
          floating in the middle of the dim. With the panel sized to the viewport
          the film takes what the transport does not, and `object-contain`
          letterboxes whatever shape the real cut turns out to be.
        */}
        <div className="relative min-h-0 w-full flex-1 overflow-hidden bg-ink">
          {src ? (
            <video
              ref={video}
              src={src}
              playsInline
              autoPlay
              preload="auto"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => {
                setDuration(e.currentTarget.duration);
                setMuted(e.currentTarget.muted);
              }}
              className="size-full object-contain"
            >
              <track kind="captions" />
            </video>
          ) : (
            <PlaceholderReel runtime={label} captions={captions} />
          )}
        </div>

        {/*
          The transport. Disabled wholesale with no film: buttons that look live
          and do nothing are worse than buttons that say they are waiting.
        */}
        <div className="flex shrink-0 flex-wrap items-center gap-2 bg-ink/80 p-2">
          <TransportButton onClick={toggle} disabled={!src} label={playing ? "Pause" : "Play"}>
            {playing ? "❚❚" : "▶"}
          </TransportButton>
          <TransportButton
            onClick={() => seekBy(-SKIP)}
            disabled={!src}
            label={`Back ${SKIP} seconds`}
          >
            ↺{SKIP}
          </TransportButton>
          <TransportButton
            onClick={() => seekBy(SKIP)}
            disabled={!src}
            label={`Forward ${SKIP} seconds`}
          >
            ↻{SKIP}
          </TransportButton>

          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={time}
            disabled={!src || !duration}
            aria-label="Seek"
            onChange={(e) => {
              const el = video.current;
              if (el) el.currentTime = Number(e.target.value);
            }}
            className="h-1 min-w-24 grow appearance-none bg-paper/25 accent-signal disabled:opacity-40"
          />

          <Label tone="paper" className="tabular-nums opacity-70">
            {src ? `${clock(time)} / ${clock(duration)}` : "Transport arrives with the film"}
          </Label>

          <TransportButton
            onClick={() => {
              const el = video.current;
              if (!el) return;
              el.muted = !el.muted;
              setMuted(el.muted);
            }}
            disabled={!src}
            label={muted ? "Unmute" : "Mute"}
          >
            {muted ? "🔇" : "🔊"}
          </TransportButton>

          <button
            type="button"
            onClick={onClose}
            className="ms-auto bg-signal px-4 py-2 font-sans text-sm font-medium text-ink"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function TransportButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="min-w-11 px-3 py-2 font-mono text-xs text-paper transition-colors hover:bg-paper/10 disabled:opacity-40 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}

/** `m:ss`, and `--:--` before metadata has landed. */
function clock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}
