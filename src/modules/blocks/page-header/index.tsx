import { Label } from "@/components/ui/Label";
import { Panel } from "@/components/ui/Panel";
import { Cell, MediaCell } from "@/components/ui/Cell";
import { PlaceholderReel } from "@/components/ui/PlaceholderReel";
import type { PageHeaderProps } from "./block.config";

/**
 * The masthead for a sub-route.
 *
 * Deliberately not a second hero. The home page's hero is the one place the
 * traced figure appears and the one place the display type runs to six rems;
 * repeating that on every route would spend the effect and make each page look
 * like a different attempt at the same landing page. Same type system, one step
 * quieter.
 *
 * A block rather than a layout component precisely so those pages stay
 * compositions and never grow markup of their own (CLAUDE.md §2.2).
 */
export default function PageHeader({
  eyebrow,
  headline,
  lead,
  meta,
  reel,
  photo,
}: PageHeaderProps) {
  return (
    <Panel className="relative grid-rows-[1fr_auto]">
      {/* The photograph. Behind everything, heavily knocked back — it warms the
          page without competing with a headline for the same pixels. */}
      {photo ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-[0.13] grayscale-[0.35]"
          style={{ backgroundImage: `url(${photo.src})` }}
        />
      ) : null}

      <Cell
        eyebrow={eyebrow}
        className={photo ? "bg-transparent" : undefined}
        bodyClassName="justify-center gap-6"
      >
        <h1 className="max-w-[16ch] font-display text-[clamp(2.25rem,6vw,6rem)] leading-[0.9] font-bold text-ink">
          {headline}
        </h1>
        {lead ? (
          <p className="max-w-[52ch] font-sans text-base text-soft lg:text-lg">{lead}</p>
        ) : null}
      </Cell>

      {reel ? (
        <MediaCell className="aspect-[21/9] w-full">
          {reel.src ? (
            <video
              src={reel.src}
              muted
              loop
              playsInline
              preload="none"
              className="size-full object-cover"
            />
          ) : (
            <PlaceholderReel runtime={reel.runtime} />
          )}
        </MediaCell>
      ) : null}

      {meta.length > 0 ? (
        <div className="grid-cells grid grid-cols-2 md:grid-cols-3">
          {meta.map((item) => (
            <div key={item} className="cell justify-center px-gutter py-3.5">
              <Label>{item}</Label>
            </div>
          ))}
        </div>
      ) : null}
    </Panel>
  );
}
