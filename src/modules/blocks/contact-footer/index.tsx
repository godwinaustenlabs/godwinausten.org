import { Label } from "@/components/ui/Label";
import { Panel } from "@/components/ui/Panel";
import { Cell, MediaCell, TileCell } from "@/components/ui/Cell";
import type { ContactFooterProps } from "./block.config";

type Network = ContactFooterProps["socials"][number]["network"];

const NETWORK_NAME: Record<Network, string> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
};

/**
 * The two logos, drawn in `currentColor` so they take the ink like the type
 * beside them. Instagram is stroked to the same weight as LinkedIn's counters
 * so the pair reads as one set rather than two downloads.
 */
function NetworkLogo({ network }: { network: Network }) {
  if (network === "instagram") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-5">
        <rect x="2" y="2" width="20" height="20" rx="5.5" />
        <circle cx="12" cy="12" r="4.5" />
        <circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

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
  socials,
  wordmark,
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
        /*
          A lifted black, not `--color-ink`.

          This cell used to carry a photograph at 30% over ink, and what that
          actually did — whatever the picture was — was raise the ground to a
          charcoal. Removing the photograph without replacing that lift drops the
          cell to #0E0E0C, which against the paper beside it reads as a hole
          punched in the page rather than as the dark half of a spread.

          One value, one use, so it stays a literal here rather than becoming a
          palette token nothing else would reference.
        */
        className="cell-ink col-span-full min-h-[26svh] bg-[#1B1B18] md:col-span-1 md:min-h-0"
        style={{ containerType: "inline-size" }}
      >
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

      {/*
        The socials take a column of their own at the end of the address row
        rather than a row of their own: the panel is the band and does not
        grow, so a new row would come out of the headline's room. Below `sm`
        the addresses stack, and the logos stack beside them.
      */}
      <div className="grid-cells col-span-full grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
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
        {socials.length > 0 && (
          <div className="cell col-start-2 row-span-2 row-start-1 flex-col items-center justify-center gap-4 px-gutter py-3.5 sm:col-start-3 sm:row-span-1 sm:flex-row sm:gap-5">
            {socials.map((social) => (
              <a
                key={social.network}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Godwin Austen Labs on ${NETWORK_NAME[social.network]}`}
                className="text-ink opacity-70 transition-opacity hover:opacity-100 focus-visible:opacity-100"
              >
                <NetworkLogo network={social.network} />
              </a>
            ))}
          </div>
        )}
      </div>
    </Panel>
  );
}
