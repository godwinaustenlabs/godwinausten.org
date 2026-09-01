"use client";

import { useActionState, useId } from "react";
import { requestPlaybook, type LeadMagnetState } from "@/server/actions/lead-magnet";
import { Label } from "@/components/ui/Label";

const INITIAL: LeadMagnetState = { status: "idle" };

/**
 * The lead-magnet opt-in.
 *
 * Inline and minimal — a rule, a field, a word. Deliberately not a boxed card:
 * a bordered panel here would be the one piece of card chrome on the whole page
 * and would read as an ad. It sits on ink, so every colour here is a paper tint
 * and the accent does the work the ink-on-paper underline does elsewhere.
 *
 * Built on `useActionState` over a real `<form action>`, so it submits and works
 * before hydration. Most conversions happen on a phone on a bad connection
 * (docs/brief.md) — the form has to work while the JS is still arriving.
 */
export function PlaybookForm({
  placeholder,
  submit,
  micro,
  success,
  successBody,
}: {
  placeholder: string;
  submit: string;
  micro: string;
  success: string;
  successBody: string;
}) {
  const [state, formAction, pending] = useActionState(requestPlaybook, INITIAL);
  const fieldId = useId();
  const messageId = useId();

  if (state.status === "success") {
    return (
      <div role="status">
        <p className="flex items-baseline gap-3 font-display text-[clamp(1.75rem,3vw,2.75rem)] leading-tight font-bold text-paper">
          <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-signal" />
          {success}
        </p>
        <p className="mt-4 font-sans text-base text-paper/70">{successBody}</p>
      </div>
    );
  }

  return (
    <form action={formAction}>
      {/* Honeypot. Hidden from sight and from assistive tech, but a bot filling
          every field in the DOM will still take it. */}
      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden">
        <input type="text" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      {/* The section headline is the label; repeating it beside the field would
          say the same thing twice. Screen readers still get one. */}
      <label htmlFor={fieldId} className="sr-only">
        {placeholder}
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
        {/*
          A filled block, not a text link. This is the page's one conversion and
          the only filled accent on it; as tinted text beside a hairline
          underline it read as a footnote.
        */}
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
  );
}
