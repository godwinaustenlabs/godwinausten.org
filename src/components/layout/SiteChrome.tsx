import { SiteLink } from "@/modules";
import { Label } from "@/components/ui/Label";
import { siteCopy } from "@/content/copy/site";
import { RouteLabel } from "./RouteLabel";

/**
 * The site chrome: a fixed bar at the top and another at the bottom.
 *
 * Read from oddcommon.com, and it is the frame the whole layout is built
 * against. The two bars are always there, always the same height, and every
 * panel occupies exactly the band between them (`--band`, see
 * `src/components/ui/Panel.tsx`). Nothing scrolls under them and nothing spills
 * past them.
 *
 * The top one is the wordmark alone; every link lives in the rail at the foot.
 * They are **solid**, not transparent overlays. An earlier version used
 * `mix-blend-difference` so the nav could float over the content — legible, but
 * it meant content and chrome shared the same pixels and a section head
 * regularly parked itself under the nav. A bar with its own ground and a
 * hairline under it is the honest version, and it is what makes the band a real
 * constraint rather than a suggestion.
 *
 * Not a block, on purpose: blocks are page *sections* placed by a composition,
 * and this belongs to no position in the page. It reads `siteCopy` directly
 * rather than taking props — the one deliberate exception to "content arrives
 * as props", because threading the same four strings through four page
 * compositions would only create four places for them to drift apart.
 */
export function SiteChrome({ mainId }: { mainId: string }) {
  return (
    <>
      {/*
       * The skip link matters more here than on an ordinary page: visual order
       * is horizontal on the home page while DOM order is linear, so a keyboard
       * visitor needs an explicit way past the chrome into the content.
       */}
      <a
        href={`#${mainId}`}
        className="label sr-only bg-ink px-4 py-3 text-paper focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50"
      >
        {siteCopy.skipToContent}
      </a>

      {/*
       * The top bar carries the wordmark and the route it is on.
       *
       * All navigation is in the bottom rail. Two rows of links competing at
       * opposite ends of the screen is one row too many, and a bar with a single
       * mark in it reads as a signature rather than as a menu — which is the
       * point of the top of the page.
       */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-[var(--chrome-top)] items-center justify-between gap-4 border-b border-hairline bg-paper px-gutter">
        <div className="flex min-w-0 items-baseline gap-3 sm:gap-4">
          <SiteLink href="/">
            {/*
              Larger than a `Label`'s 11px.

              It is the only mark in the bar and it was set at caption size,
              which made the signature the smallest type on the page. At 20px it
              still reads as mono chrome rather than as a heading, and it is the
              first thing the eye finds instead of the last. The tracking comes
              down as the size goes up — mono letter-spacing that flatters 11px
              pulls a 20px line apart, and on a phone it would run into the dot.
            */}
            <Label
              tone="ink"
              className="text-[1.05rem] font-medium tracking-[0.1em] whitespace-nowrap sm:text-[1.25rem] sm:tracking-[0.13em]"
            >
              {siteCopy.wordmark}
            </Label>
          </SiteLink>

          <RouteLabel />
        </div>

        <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-signal" />
      </header>

      {/* The rail. Every route on the site, evenly spread. Seams are drawn as
          gaps over a hairline ground so they stay exactly one pixel at any
          width, with no doubled line at the wrap point on a phone. */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 h-[var(--chrome-bottom)] border-t border-hairline bg-paper"
      >
        {/*
          The gutter is a page margin and it is too wide for a quarter of a
          narrow screen: four cells each inset by it left the labels with less
          room than the words needed, and they clipped. The inset scales with
          the cell here instead, and `truncate` guarantees the failure mode is an
          ellipsis rather than a letter sliced down the middle.
        */}
        <ul className="grid h-full grid-cols-2 gap-px bg-hairline sm:grid-cols-4">
          {siteCopy.nav.map((item) => (
            <li key={item.label} className="min-w-0 bg-paper">
              <SiteLink
                href={item.href}
                className="label flex h-full items-center px-[clamp(0.85rem,3vw,var(--gutter))] text-soft transition-colors hover:text-ink focus-visible:text-ink"
              >
                <span className="truncate">{item.label}</span>
              </SiteLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
