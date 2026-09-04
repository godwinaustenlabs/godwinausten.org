import { Label } from "@/components/ui/Label";
import { Panel } from "@/components/ui/Panel";
import { Cell, NextCell } from "@/components/ui/Cell";
import { FilmFrame } from "@/components/ui/FilmFrame";
import type { VslPanelProps } from "./block.config";

/**
 * The video, as the page's closing argument.
 *
 * It sits after the opt-in. By the time a reader reaches it they have either
 * already given us an email or they want more than the summary gave them —
 * either way four minutes is a reasonable ask, which it is not, cold, above the
 * fold.
 *
 * The frame never autoplays with sound and never preloads the whole file: the
 * inline loop is muted and starts on hover, and the film itself does not load
 * until the visitor opens it. That way the panel costs nothing to scroll past
 * and does not compete with the hero for bandwidth on first load. No reveal
 * animation either — time to first frame is what matters here.
 *
 * There is no chapter list under it. Four tiles naming what the film covers
 * read as an index of a film nobody has watched yet — a second thing to scan on
 * a panel whose only job is to get the film played. The same ground is covered
 * by one line of body copy beside it, which costs a row instead of a grid.
 */
export default function VslPanel({
  index,
  eyebrow,
  headline,
  body,
  videoLabel,
  src,
  next,
}: VslPanelProps) {
  return (
    <Panel
      /*
       * One screen wide, not 1.2.
       *
       * The extra fifth was room for three cells across — the claim, the tile
       * and the film. With the film now taking two thirds of a single cell, a
       * panel wider than the screen simply ran it off the trailing edge on the
       * filmstrip, which is the one section where the whole offer has to be
       * visible at once.
       */
      width={1}
      /*
        The band is a floor from `md` up only. On a phone the panel is a heading,
        a paragraph and a 16:9 film — about 580px of content in a 744px box, and
        the 160px left over sat under the film as a blank page.
      */
      className="grid-rows-[auto_1fr_auto] md:min-h-[var(--band)] strip:min-h-0"
    >
      <div className="cell col-span-full flex-row items-center gap-4 px-gutter py-3">
        <Label tone="ink" className="opacity-40">
          {index}
        </Label>
        <Label>{eyebrow}</Label>
      </div>

      {/*
        One cell, not three.

        The claim, a vertical "Demo reel" tile and the film used to be separate
        grid children, which meant two seams across the panel — and a seam on
        this grid is a visible hairline, so the section read as three things that
        happened to be adjacent rather than one offer. The tile is gone and the
        other two share a cell: the claim takes a third on the left, the film
        takes the rest, and nothing is drawn between them.
      */}
      <Cell
        className="col-span-full"
        bodyClassName="justify-center gap-8 md:flex-row md:items-center md:gap-[clamp(2rem,4vw,4.5rem)]"
      >
        <div className="shrink-0 md:w-[34%]">
          <h2 className="font-display text-[clamp(1.85rem,3.4vw,3.25rem)] leading-[0.95] font-bold text-ink">
            {headline}
          </h2>
          <p className="mt-5 max-w-[34ch] font-sans text-base text-soft">{body}</p>
        </div>

        {/*
          16:9 at every width, and edge to edge on a phone.

          `flex-1` is the reason it was neither. In the row this becomes from
          `md` up it is doing real work — the claim takes its third and the film
          takes the rest. Stacked in a column it was growing the box *vertically*
          instead, which gave it a definite height, and a definite height is what
          makes `aspect-ratio` ignorable: the box came out 350×476 on a phone
          with the film letterboxed to 350×197 inside it and the panel's own ink
          showing as bands above and below. It is `md:flex-1` now, so the
          aspect holds where nothing is competing with it.

          The negative gutter is the other half: the cell pads its body by a page
          gutter, and the film is the one thing in this panel that should touch
          the screen. `w-auto` with it, because a `w-full` pulled left by a
          gutter is simply the same width hanging off the other edge.

          `aspect-video` on the box rather than a height: the film is the
          evidence and it is shown whole, never cropped to whatever shape the row
          came out as.

          `src` is resolved from R2 at compose time, so it is a string once the
          owner has uploaded the cut and absent until then — see
          `src/server/media.ts`. `FilmFrame` is complete either way: the frame
          runs the drawn placeholder reel rather than sitting black behind a
          label, because an empty player reads as broken.
        */}
        <div className="-mx-gutter aspect-video w-auto min-w-0 overflow-hidden bg-ink md:mx-0 md:w-full md:flex-1">
          <FilmFrame src={src} label={videoLabel} openLabel="Watch it" />
        </div>
      </Cell>

      <div className="cell col-span-full hidden md:flex">
        <NextCell next={next} />
      </div>
    </Panel>
  );
}
