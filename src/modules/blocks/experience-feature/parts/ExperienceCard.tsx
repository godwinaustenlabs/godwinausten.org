import { Label } from "@/components/ui/Label";
import { SiteLink } from "@/modules";
import { ExperienceVideo } from "./ExperienceVideo";

/**
 * One experience, as a card in someone else's grid.
 *
 * It used to be a whole panel with a paragraph, a notes row and a call to
 * action. That was more room than one build needs on a landing page: a visitor
 * scanning the home page wants to know we have shipped something real and what
 * it was, and the detail belongs on `/work`, where someone has already decided
 * they care.
 *
 * A clip, a name, a line, and the metadata that makes it credible — the whole
 * card links through.
 */
export function ExperienceCard({
  eyebrow,
  client,
  name,
  body,
  notes,
  videoLabel,
  src,
  cta,
}: {
  eyebrow: string;
  client: string;
  name: string;
  body: string;
  notes: { label: string; value: string }[];
  videoLabel: string;
  src?: string;
  cta: { label: string; href: string };
}) {
  return (
    <SiteLink
      href={cta.href}
      className="cell group h-full min-h-0 transition-colors hover:bg-hairline/30"
    >
      <div className="cell-bar border-b border-hairline">
        <Label tone="soft">{eyebrow}</Label>
        <Label tone="soft" className="ms-auto opacity-60">
          {client}
        </Label>
      </div>

      {/*
        The clip takes whatever height is left after the text, rather than
        claiming a fixed aspect.
        
        With `aspect-video` it set its own height first and the notes underneath
        fell off the bottom of the panel — a panel does not grow, so something
        has to give, and it should be the picture rather than the facts.
      */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <ExperienceVideo label={videoLabel} src={src} />
      </div>

      <div className="flex shrink-0 flex-col gap-4 px-gutter py-4">
        <div>
          <h3 className="font-display text-[clamp(1.3rem,1.9vw,1.9rem)] leading-[1.02] font-medium text-ink">
            {name}
            <span
              aria-hidden="true"
              className="ms-2 inline-block text-signal transition-transform group-hover:translate-x-1"
            >
              ↗
            </span>
          </h3>
          <p className="mt-3 font-sans text-sm leading-relaxed text-soft">{body}</p>
        </div>

        <dl className="flex flex-wrap gap-x-7 gap-y-1.5 border-t border-hairline pt-3">
          {notes.map((note) => (
            <div key={note.label} className="flex flex-col gap-0.5">
              <Label className="opacity-50">{note.label}</Label>
              <dd className="font-sans text-xs text-ink">{note.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </SiteLink>
  );
}
