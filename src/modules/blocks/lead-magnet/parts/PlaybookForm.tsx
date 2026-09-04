"use client";

import { useActionState, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { requestPlaybook, type LeadMagnetState } from "@/server/actions/lead-magnet";
import { Label } from "@/components/ui/Label";

const INITIAL: LeadMagnetState = { status: "idle" };

/** Nothing ever changes, so nothing ever needs to be told about it. */
const subscribeNever = () => () => {};

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
 * ## The dialog, and the disclosure underneath it
 *
 * The owner asked for the field to arrive as a pop-up, and a pop-up needs two
 * things this page cannot give it for free: a portal, and script. `position:
 * fixed` inside the filmstrip's transformed track resolves against the *track*,
 * so a dialog rendered in place opens underneath the site's own chrome — the
 * same trap `FilmFrame` documents. The fix is the same: portal to `<body>`.
 *
 * That would normally cost the thing the original was built around. Most
 * conversions here happen on a phone on a bad connection (docs/brief.md), which
 * is exactly when the script is still in flight, and a click-to-reveal built on
 * `useState` is closed and inert for that visitor.
 *
 * So it is both, and which one you get depends on what has arrived:
 *
 * - **Server HTML, and any moment before hydration.** A native
 *   `<details>`/`<summary>`: the button opens the field inline and the form
 *   submits through its `action` with no JavaScript at all.
 * - **After hydration.** The same button, and the field in a portalled dialog
 *   with a backdrop, Escape, a close control and the page behind it locked.
 *
 * The swap is invisible because the disclosure is closed in both states. What it
 * buys is that the offer is never a dead button.
 *
 * ## The download
 *
 * The action hands back a URL and the browser is sent to it the moment it
 * arrives — the dialog closes itself on the same tick, so the visitor sees the
 * file start rather than a form they have to dismiss. The response carries
 * `Content-Disposition: attachment`, so it downloads rather than navigating and
 * the page stays where it was. The link is repeated in the success state
 * because a pop-up blocker, an in-app browser, or a slow bucket can all swallow
 * the automatic attempt, and "it said it sent it and nothing happened" is the
 * worst version of this flow.
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
  const [open, setOpen] = useState(false);
  /*
   * Has this hydrated?
   *
   * `useSyncExternalStore` with a server snapshot of `false` and a client one of
   * `true` is the sanctioned way to ask: it never subscribes to anything, so it
   * returns `false` for the server render and `true` from the first client
   * render onward, with no state written from an effect for React to warn about
   * and no flash between the two.
   */
  const enhanced = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
  const fieldId = useId();
  const messageId = useId();
  const started = useRef(false);

  const href = state.status === "success" ? state.href : undefined;

  useEffect(() => {
    // Once per success. Without the ref a re-render for any other reason would
    // fire a second download.
    if (!href || started.current) return;
    started.current = true;
    setOpen(false);
    window.location.href = href;
  }, [href]);

  if (state.status === "success") {
    return (
      /*
        Ink, not paper. This replaces the offer *in the cell*, and the cell is
        the site's own paper — the dark tones here were correct only while the
        whole panel was an ink block.
      */
      <div role="status">
        <p className="flex items-baseline gap-3 font-display text-[clamp(1.75rem,3vw,2.75rem)] leading-tight font-bold text-ink">
          <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-signal" />
          {success}
        </p>
        <p className="mt-4 font-sans text-base text-soft">{successBody}</p>
        <a
          href={href}
          className="signal-link mt-4 inline-block font-sans text-base font-medium text-ink"
        >
          {again}
        </a>
      </div>
    );
  }

  const button = (
    <>
      {cta}
      <span aria-hidden="true" className="text-xl">
        ↓
      </span>
    </>
  );
  const buttonClass =
    "flex w-full cursor-pointer list-none items-center justify-between gap-4 rounded-sm bg-signal px-6 py-4 font-sans text-lg font-medium text-ink transition-transform hover:-translate-y-px sm:px-8 sm:py-5 sm:text-xl [&::-webkit-details-marker]:hidden";

  /*
   * The field is rendered on two different grounds.
   *
   * Hydrated, it opens in the dialog, which dims the page behind it and is dark.
   * Before hydration it is a native `<details>` that opens *in the cell*, and
   * the cell is paper. One set of colours cannot be right in both places, and
   * the version that was wrong was the one a visitor sees while the JavaScript
   * is still arriving — so it takes the ground as an argument rather than
   * assuming it.
   */
  const renderForm = (onDark: boolean) => (
    <form action={formAction}>
      {/* Honeypot. Hidden from sight and from assistive tech, but a bot filling
          every field in the DOM will still take it. */}
      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden">
        <input type="text" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      <label
        htmlFor={fieldId}
        className={`mb-3 block font-sans text-base ${onDark ? "text-paper/70" : "text-soft"}`}
      >
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
          className={`min-w-0 grow rounded-sm border px-4 py-3.5 font-sans text-base outline-none ${
            onDark
              ? "border-paper/25 bg-paper/[0.04] text-paper placeholder:text-paper/40 focus:border-paper/60"
              : "border-hairline bg-ink/[0.02] text-ink placeholder:text-ink/35 focus:border-ink/50"
          }`}
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-sm bg-signal px-6 py-3.5 font-sans text-base font-medium text-ink transition-transform hover:-translate-y-px disabled:opacity-50"
        >
          {pending ? "Sending…" : submit}
        </button>
      </div>

      {state.status === "error" ? (
        // Lime carries an error against the dim; against paper it disappears.
        <p
          id={messageId}
          role="alert"
          className={`mt-3 font-sans text-sm ${onDark ? "text-signal" : "font-medium text-ink"}`}
        >
          {state.message}
        </p>
      ) : null}

      <Label as="p" className={`mt-5 ${onDark ? "text-paper/50" : "text-soft"}`}>
        {micro}
      </Label>
    </form>
  );

  // Before hydration: the native disclosure, which needs nothing to work.
  if (!enhanced) {
    return (
      <details className="group">
        <summary className={`${buttonClass} group-open:hidden`}>{button}</summary>
        <div className="pt-6">{renderForm(false)}</div>
      </details>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={buttonClass}>
        {button}
      </button>
      {open || pending || state.status === "error" ? (
        <PlaybookDialog label={cta} onClose={() => setOpen(false)}>
          {renderForm(true)}
        </PlaybookDialog>
      ) : null}
    </>
  );
}

/**
 * The dialog the field arrives in.
 *
 * Portalled to `<body>` for the reason given above, and otherwise the plainest
 * possible modal: a dim you can click through to leave, Escape, a close control,
 * and the page behind it held still. `max-h` with an inner scroll rather than a
 * fixed height, because this opens on a phone in landscape as often as anywhere
 * else and a dialog taller than the screen is a form with a submit button nobody
 * can reach.
 */
function PlaybookDialog({
  label,
  onClose,
  children,
}: {
  /**
   * The dialog's accessible name — the *offer*, not the question inside it.
   *
   * Naming it with the field's prompt gives two elements the same accessible
   * name, and "find the thing labelled 'where do we send it?'" then matches both
   * the dialog and the input in it. The name of a dialog is what you opened, not
   * what it asks.
   */
  label: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    // Focus the field, not the panel: this dialog exists to be typed into.
    panel.current?.querySelector<HTMLInputElement>('input[type="email"]')?.focus();
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
      {/* The dim. A button so a pointer *or* a keyboard can dismiss by leaving,
          and `aria-hidden` because Escape and the close control already say
          this in the accessibility tree. */}
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
      />

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="glass relative max-h-[calc(100dvh-2rem)] w-full max-w-[34rem] overflow-y-auto rounded-lg p-6 sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute end-3 top-3 flex size-9 items-center justify-center rounded-full text-paper/60 transition-colors hover:bg-paper/10 hover:text-paper"
        >
          <span aria-hidden="true" className="text-lg leading-none">
            ✕
          </span>
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}
