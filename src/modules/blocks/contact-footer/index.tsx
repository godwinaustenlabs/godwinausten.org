import { Label } from "@/components/ui/Label";
import { Panel } from "@/components/ui/Panel";
import { Cell, MediaCell, TileCell } from "@/components/ui/Cell";
import type { ContactFooterProps } from "./block.config";

/**
 * Contact, and the end of the page.
 *
 * Read from docs/inspiration/raw/03-oddcommon-reach-out.png: a solid ink cell
 * butting a paper one with zero gap, the wordmark set enormous and cropped by
 * the cell edge rather than fitted inside it. Cropping is the point — type that
 * runs off the edge tells you the page is a surface, not a container.
 *
 * The addresses are their own cells, and this is the one panel with no hand-off
 * at the foot: it is the end, and the fixed bottom rail is the way back.
 */
export default function ContactFooter({
  index,
  eyebrow,
  headline,
  body,
  channels,
  wordmark,
  photo,
}: ContactFooterProps) {
  return (
    <Panel className="grid-rows-[auto_1fr_auto] md:grid-cols-[minmax(0,0.9fr)_auto_minmax(0,1.1fr)] md:grid-rows-[auto_1fr_auto]">
      <div className="cell col-span-full flex-row items-center gap-4 px-gutter py-3">
        <Label tone="ink" className="opacity-40">
          {index}
        </Label>
        <Label>{eyebrow}</Label>
      </div>

      {/*
        The wordmark, cropped by the cell.
        
        Sized off the *cell's* width rather than the viewport's, and pushed past
        both its left and bottom edges, so it is always cut — which is the point.
        A `vw`-based size let it fit inside the cell at some widths and the crop
        simply stopped happening, which read as a typo rather than as a
        deliberate bleed.
      */}
      <MediaCell
        className="cell-ink col-span-full min-h-[26svh] md:col-span-1 md:min-h-0"
        style={{ containerType: "inline-size" }}
      >
        {photo ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-30 grayscale-[0.3]"
            style={{ backgroundImage: `url(${photo})` }}
          />
        ) : null}
        <span
          aria-hidden="true"
          className="absolute bottom-[-0.18em] -left-[0.08em] z-10 font-display text-[38cqw] leading-[0.78] font-bold whitespace-nowrap text-paper/90"
        >
          {wordmark}
        </span>
      </MediaCell>

      {/* No label: a two-word caption wraps mid-phrase in a 56px tile. */}
      <TileCell tone="signal" className="hidden w-14 md:flex" />

      <Cell className="col-span-full md:col-span-1" bodyClassName="justify-center gap-5">
        <h2 className="max-w-[14ch] font-display text-[clamp(1.85rem,3.8vw,3.75rem)] leading-[0.92] font-bold text-ink">
          {headline}
        </h2>
        <p className="max-w-[42ch] font-sans text-base text-soft">{body}</p>
      </Cell>

      <div className="grid-cells col-span-full grid grid-cols-1 sm:grid-cols-2">
        {channels.map((channel) => (
          <div key={channel.email} className="cell gap-1 px-gutter py-3.5">
            <Label className="opacity-60">{channel.label}</Label>
            <a
              href={`mailto:${channel.email}`}
              className="signal-link font-sans text-base text-ink"
            >
              {channel.email}
            </a>
          </div>
        ))}
      </div>
    </Panel>
  );
}
