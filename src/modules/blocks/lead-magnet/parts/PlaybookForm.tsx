"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { requestPlaybook, type LeadMagnetState } from "@/server/actions/lead-magnet";
import { Label } from "@/components/ui/Label";

const INITIAL: LeadMagnetState = { status: "idle" };

/**
 * The lead-magnet opt-in: one loud button, then one field, then the file.
 *
 * ## Two steps, not one
 *
 * A visible email field is a question. A button is an offer. Asking for the
 * address only *after* someone has said they want the thing means the field
 * arrives when they have already decided, which is the cheapest conversion win
 * available on a page like this.
 *
 * ## Why `<details>` and not `useState`
 *
 * The disclosure is a `<details>`/`<summary>` pair, so the whole two-step
 * behaviour is native: with JavaScript switched off, or before hydration
 * arrives, the button still opens the field and the form still submits through
 * its `action`. Most conversions here happen on a phone on a bad connection
 * (docs/brief.md), which is exactly when the JS is still in flight — a
 * click-to-reveal built on `useState` is closed and inert for that visitor.
 *
 * React only *forces* it open, never closed: after a validation error or during
 * a submit it must not collapse over the field someone is using.
 *
 * ## The download
 *
 * The action hands back a URL and the browser is sent to it. The response
 * carries `Content-Disposition: attachment`, so it downloads rather than
 * navigating — the page the visitor is reading stays exactly where it was. The
 * link is repeated in the success state because a pop-up blocker, an in-app
 * browser, or a slow bucket can all swallow the automatic attempt, and "it said
 * it sent it and nothing happened" is the worst version of this flow.
 */
export function PlaybookForm({
  cta,
  prompt,
  placeholder,
  submit,
  micro,
  success,
  successBody,
  again,
}: {
  /** The loud one. What the visitor presses before being asked anything. */
  cta: string;
  /** The question the field is answering. Not the placeholder repeated. */
  prompt: string;
  placeholder: string;
  submit: string;
  micro: string;
  success: string;
  successBody: string;
  /** Manual fallback link, for when the automatic download does not fire. */
  again: string;
}) {
  const [state, formAction, pending] = useActionState(requestPlaybook, INITIAL);
  const [opened, setOpened] = useState(false);
  const fieldId = useId();
  const messageId = useId();
  const started = useRef(false);

  const href = state.status === "success" ? state.href : undefined;

  useEffect(() => {
    // Once per success. Without the ref a re-render for any other reason would
    // fire a second download.
    if (!href || started.current) return;
    started.current = true;
    window.location.href = href;
  }, [href]);

  if (state.status === "success") {
    return (
      <div role="status">
        <p className="flex items-baseline gap-3 font-display text-[clamp(1.75rem,3vw,2.75rem)] leading-tight font-bold text-paper">
          <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-signal" />
          {success}
        </p>
        <p className="mt-4 font-sans text-base text-paper/70">{successBody}</p>
        <a
          href={href}
          className="signal-link mt-4 inline-block font-sans text-base font-medium text-paper"
        >
          {again}
        </a>
      </div>
    );
  }

  return (
    <details
      open={opened || pending || state.status === "error"}
      onToggle={(event) => setOpened(event.currentTarget.open)}
      className="group"
    >
      {/*
        The button. `list-none` on both selectors because Safari draws the
        disclosure triangle through a different pseudo-element than everyone
        else, and a marker sitting inside the accent block reads as a glyph
        nobody chose.
      */}
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 bg-signal px-6 py-4 font-sans text-lg font-medium text-ink transition-transform group-open:hidden hover:-translate-y-px [&::-webkit-details-marker]:hidden">
        {cta}
        <span aria-hidden="true" className="text-xl">
          ↓
        </span>
      </summary>

      <form action={formAction}>
        {/* Honeypot. Hidden from sight and from assistive tech, but a bot
            filling every field in the DOM will still take it. */}
        <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden">
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </div>

        <label htmlFor={fieldId} className="mb-3 block font-sans text-base text-paper/70">
          {prompt}
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id={fieldId}
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={placeholder}
            aria-describedby={state.status === "error" ? messageId : undefined}
            aria-invalid={state.status === "error"}
            className="min-w-0 grow border border-paper/25 bg-paper/[0.04] px-4 py-3.5 font-sans text-base text-paper outline-none placeholder:text-paper/40 focus:border-paper/60"
          />
          <button
            type="submit"
            disabled={pending}
            className="shrink-0 bg-signal px-6 py-3.5 font-sans text-base font-medium text-ink transition-transform hover:-translate-y-px disabled:opacity-50"
          >
            {pending ? "Sending…" : submit}
          </button>
        </div>

        {state.status === "error" ? (
          <p id={messageId} role="alert" className="mt-3 font-sans text-sm text-signal">
            {state.message}
          </p>
        ) : null}

        <Label as="p" className="mt-5 text-paper/50">
          {micro}
        </Label>
      </form>
    </details>
  );
}
