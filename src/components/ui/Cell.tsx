import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/Label";
import { SiteLink } from "@/modules";

/**
 * The cell — the only container on this site.
 *
 * Read from oddcommon.com. Content lives in rectangular cells that butt
 * together and are told apart by a one-pixel seam; a cell has an optional
 * eyebrow **bar** across its top and an optional action **bar** across its
 * bottom, both flush to its edges, with the body between them.
 *
 * That is what makes a page look designed rather than assembled: every eyebrow
 * on the site sits in the same place relative to its box, and every headline
 * starts at the same inset. Content that floats freely inside a section is what
 * reads as "text in random places", and this component exists so no block has
 * the option.
 *
 * It is *not* a card. There is no border around it, no radius and no shadow —
 * what you see between two cells is the ground showing through a gap. Cells run
 * to the panel edge and bleed off it.
 */
export function Cell({
  eyebrow,
  index,
  aside,
  tone = "paper",
  action,
  bodyClassName,
  className,
  children,
}: {
  /** Mono label in the top bar. Omit for a cell that is pure media. */
  eyebrow?: string;
  /** Section number, set beside the eyebrow at low contrast. */
  index?: string;
  /** Right-aligned mono note in the top bar. */
  aside?: string;
  tone?: "paper" | "ink";
  /** Bottom bar. The accent square at its end is the only lime fill allowed. */
  action?: { label: string; href: string };
  bodyClassName?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const dark = tone === "ink";
  const seam = dark ? "border-paper/15" : "border-hairline";

  return (
    <div className={cn("cell", dark && "cell-ink", className)}>
      {eyebrow ? (
        <div className={cn("cell-bar border-b", seam)}>
          {index ? (
            <Label tone={dark ? "paper" : "ink"} className="opacity-40">
              {index}
            </Label>
          ) : null}
          <Label tone={dark ? "paper" : "soft"}>{eyebrow}</Label>
          {aside ? (
            <Label tone={dark ? "paper" : "soft"} className="ms-auto opacity-60">
              {aside}
            </Label>
          ) : null}
        </div>
      ) : null}

      <div className={cn("cell-body", bodyClassName)}>{children}</div>

      {action ? (
        <SiteLink
          href={action.href}
          className={cn(
            "cell-bar group border-t transition-colors",
            seam,
            dark ? "hover:bg-paper/5" : "hover:bg-hairline/40",
          )}
        >
          <Label tone={dark ? "paper" : "ink"} className="font-medium">
            {action.label}
          </Label>
          {/* The accent square, flush to the cell's corner. */}
          <span
            aria-hidden="true"
            className="ms-auto -me-[var(--gutter)] flex size-9 shrink-0 items-center justify-center self-stretch bg-signal text-ink transition-transform group-hover:-translate-y-px"
          >
            ↗
          </span>
        </SiteLink>
      ) : null}
    </div>
  );
}

/**
 * A cell whose whole body is one piece of media. No bars, no padding — the
 * image or video runs to all four edges and the seam does the framing.
 */
export function MediaCell({
  className,
  style,
  children,
}: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("cell relative overflow-hidden", className)} style={style}>
      {children}
    </div>
  );
}

/**
 * A small square of flat colour, usually at a panel's edge.
 *
 * These are the punctuation. oddcommon's grid is not a few big boxes — it is
 * large type broken up by little tiles sitting at alternating edges that catch
 * the eye on the way past. Without them a panel of three equal columns reads as
 * a table, and consecutive panels read as unrelated pages.
 *
 * Recurring the same few tones down the page is what carries continuity across
 * a seam: the accent is the thread.
 */
export function TileCell({
  tone = "ink",
  label,
  className,
  children,
}: {
  tone?: "ink" | "signal" | "hairline";
  /** Mono caption, set in the tone's contrasting colour. */
  label?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "cell items-start justify-end gap-2 p-3.5",
        tone === "ink" && "bg-ink text-paper",
        tone === "signal" && "bg-signal text-ink",
        tone === "hairline" && "bg-hairline/50 text-ink",
        className,
      )}
    >
      {children}
      {label ? (
        <Label tone={tone === "ink" ? "paper" : "ink"} className="opacity-80">
          {label}
        </Label>
      ) : null}
    </div>
  );
}

/**
 * The hand-off at the foot of a panel: what comes next, and a link to it.
 *
 * Every section ends with one. A reader is never at the bottom of a panel
 * wondering whether the page is over, and it is the plainest kind of
 * connectivity there is — the page telling you where it goes.
 */
export function NextCell({
  next,
  tone = "paper",
  className,
}: {
  next: { index: string; label: string; href: string };
  tone?: "paper" | "ink";
  className?: string;
}) {
  const dark = tone === "ink";
  return (
    <SiteLink
      href={next.href}
      className={cn(
        "cell group flex-row items-center gap-4 px-gutter py-3.5 transition-colors",
        dark ? "cell-ink hover:bg-paper/5" : "hover:bg-hairline/40",
        className,
      )}
    >
      <Label tone={dark ? "paper" : "soft"} className="opacity-50">
        Next
      </Label>
      <Label tone={dark ? "paper" : "ink"} className="opacity-40">
        {next.index}
      </Label>
      <Label tone={dark ? "paper" : "ink"} className="font-medium">
        {next.label}
      </Label>
      <span
        aria-hidden="true"
        className={cn(
          "ms-auto transition-transform group-hover:translate-x-1",
          dark ? "text-signal" : "text-ink",
        )}
      >
        →
      </span>
    </SiteLink>
  );
}
