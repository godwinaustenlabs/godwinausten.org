import { SiteLink } from "@/modules";
import { Label } from "@/components/ui/Label";
import { Panel } from "@/components/ui/Panel";
import { Cell } from "@/components/ui/Cell";
import type { DirectLineProps } from "./block.config";

/**
 * Where to send it — one address, set as large as the panel allows.
 *
 * ## What this replaced, and why
 *
 * `/contact` ran its addresses through `services-rows`: three rows — work,
 * careers, everything else — each a title in display type over a paragraph that
 * happened to open with an email address. Two things were wrong with it. The
 * address, the single most useful string on the page, was set in the same 16px
 * as the sentence explaining it; and offering three of them made the reader
 * route their own message before they could write it, on a page whose entire
 * argument is that writing to us costs one email.
 *
 * So there is one address and it is the largest thing here. The rest — careers,
 * anything that is not work — is a row of footnotes under it, and careers now
 * points at a page rather than at a second address to choose between.
 *
 * ## The second way
 *
 * A WhatsApp button, because a good number of the people this page is for will
 * not open a mail client to start a conversation and will happily start one in a
 * thread. It is set as a *button* rather than as a third line of prose: it is an
 * action, and the page should look like it has two of them, not one and a
 * footnote.
 *
 * It carries no vendor mark. `docs/adr/0008` settled that this repository never
 * draws someone else's logo — an approximation is a wrong mark, which is the one
 * thing every brand guideline forbids — and there is no WhatsApp file in
 * `scripts/logos/` to inline. The glyph is a plain speech bubble of our own, the
 * word does the naming, and nothing here implies an endorsement.
 */
export default function DirectLine({
  index,
  eyebrow,
  headline,
  email,
  whatsapp,
  notes,
}: DirectLineProps) {
  return (
    <Panel className="grid-rows-[auto_1fr_auto]">
      <div className="cell col-span-full flex-row items-center gap-4 px-gutter py-3">
        <Label tone="ink" className="opacity-40">
          {index}
        </Label>
        <Label>{eyebrow}</Label>
      </div>

      <Cell className="col-span-full" bodyClassName="justify-center gap-[clamp(1.75rem,4vh,3rem)]">
        <h2 className="max-w-[16ch] font-display text-[clamp(1.9rem,4.4vw,4rem)] leading-[0.94] font-bold text-ink">
          {headline}
        </h2>

        {/*
          The address, sized by *this cell* rather than by the window.

          It is one unbreakable token — no spaces, no hyphens — so a window-sized
          figure has no idea whether it fits, and the same lesson `services-rows`
          learned with "addresses." applies here at four times the length.
          `min(vw, cqi)` keeps the window figure wherever the cell is roomy and
          hands over to the container's own width when it is not.
        */}
        <div className="@container">
          <a
            href={`mailto:${email.address}`}
            className="signal-link inline-block max-w-full font-display text-[clamp(1.35rem,min(5.2vw,8.4cqi),4.5rem)] leading-[1.05] font-bold break-words text-ink"
          >
            {email.address}
          </a>
          <Label className="mt-4 block opacity-70">{email.note}</Label>
        </div>

        <div className="flex flex-col items-start gap-3">
          <WhatsAppButton {...whatsapp} />
          <Label className="opacity-70">{whatsapp.note}</Label>
        </div>
      </Cell>

      {/*
        Columns from the count, not a guess — the same rule the masthead's meta
        bar follows. A fixed `md:grid-cols-2` against a list that grows by one is
        a bare half-width cell of seam ground, which reads as something failing
        to load rather than as space.
      */}
      <div
        className="grid-cells col-span-full grid md:grid-cols-[repeat(var(--note-cols),minmax(0,1fr))]"
        style={{ "--note-cols": notes.length } as React.CSSProperties}
      >
        {notes.map((note) => (
          <div key={note.index} className="cell gap-3 px-gutter py-[clamp(1.25rem,3vh,2rem)]">
            <div className="flex items-baseline gap-3">
              <Label tone="ink" className="shrink-0 opacity-30">
                {note.index}
              </Label>
              <Label tone="ink" className="font-medium">
                {note.title}
              </Label>
            </div>
            <p className="max-w-[40ch] font-sans text-sm leading-relaxed text-soft">
              {note.detail}
            </p>
            {note.link ? (
              <SiteLink
                href={note.link.href}
                className="signal-link mt-auto self-start pt-2 font-sans text-sm font-medium text-ink"
              >
                {note.link.label} →
              </SiteLink>
            ) : null}
          </div>
        ))}
      </div>
    </Panel>
  );
}

/**
 * The second way in, printed rather than styled.
 *
 * A flat lime plate sitting a few pixels down and to the right of an outlined
 * paper one: the same misregistration the Labs watermark is built out of, at
 * button scale. On hover the two passes register — the plate slides home under
 * the outline — which gives the control a physical response without a shadow, a
 * radius or a fill, none of which this site has.
 *
 * `rel="noopener"` and a new tab because it leaves the site, and `wa.me` is
 * WhatsApp's own short host: it opens the app where there is one and the web
 * client where there is not, so neither platform needs a branch here.
 */
function WhatsAppButton({
  label,
  display,
  number,
}: {
  label: string;
  display: string;
  number: string;
}) {
  return (
    <a
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative inline-flex max-w-full"
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 translate-x-[5px] translate-y-[5px] bg-signal transition-transform duration-300 ease-out-expo group-hover:translate-x-0 group-hover:translate-y-0 group-focus-visible:translate-x-0 group-focus-visible:translate-y-0"
      />
      <span className="relative flex min-w-0 items-center gap-3 border border-ink bg-paper px-5 py-3.5">
        <Bubble />
        <span className="label truncate font-medium text-ink">
          {label} — {display}
        </span>
      </span>
    </a>
  );
}

/**
 * A speech bubble, ours.
 *
 * Deliberately generic: a rounded rectangle with a tail and three dots, drawn on
 * the same 1px stroke as every other line on the site. It says "a message"
 * without pretending to be anybody's mark — see the note on `docs/adr/0008` in
 * the block above.
 */
function Bubble() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 22 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      className="size-[1.15rem] shrink-0 text-ink"
    >
      {/* The bubble, with its tail dropping from the lower-left corner. */}
      <path
        d="M2.7 1h16.6a1.7 1.7 0 0 1 1.7 1.7v9.4a1.7 1.7 0 0 1-1.7 1.7H8.1L3.6 18.4v-4.6H2.7A1.7 1.7 0 0 1 1 12.1V2.7A1.7 1.7 0 0 1 2.7 1Z"
        strokeLinejoin="round"
      />
      {/* Three dots — the universal "there is something being said in here". */}
      <path d="M6.6 7.4h.01M11 7.4h.01M15.4 7.4h.01" strokeLinecap="round" strokeWidth="2.2" />
    </svg>
  );
}
