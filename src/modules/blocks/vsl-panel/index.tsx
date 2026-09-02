import { Label } from "@/components/ui/Label";
import { Panel } from "@/components/ui/Panel";
import { Cell, MediaCell, NextCell, TileCell } from "@/components/ui/Cell";
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
 * The chapters are cells rather than a list. Naming what is in the four minutes
 * is what makes a four-minute ask feel small, and as four tiles across the foot
 * of the panel they read at a glance instead of as an index.
 */
export default function VslPanel({
  index,
  eyebrow,
  headline,
  body,
  videoLabel,
  covers,
  src,
  next,
}: VslPanelProps) {
  return (
    <Panel
      width={1.2}
      className="min-h-[var(--band)] grid-rows-[auto_auto_1fr_auto_auto] md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.1fr)] md:grid-rows-[auto_1fr_auto_auto] strip:min-h-0"
    >
      <div className="cell col-span-full flex-row items-center gap-4 px-gutter py-3">
        <Label tone="ink" className="opacity-40">
          {index}
        </Label>
        <Label>{eyebrow}</Label>
      </div>

      <Cell className="col-span-full md:col-span-1" bodyClassName="justify-center gap-5">
        <h2 className="font-display text-[clamp(1.85rem,3.6vw,3.5rem)] leading-[0.95] font-bold text-ink">
          {headline}
        </h2>
        <p className="max-w-[34ch] font-sans text-base text-soft">{body}</p>
      </Cell>

      <TileCell tone="ink" label={videoLabel} className="hidden w-16 md:flex" />

      <MediaCell className="col-span-full aspect-video bg-ink md:col-span-1 md:aspect-auto">
        {/*
          `src` is resolved from R2 at compose time, so it is a string once the
          owner has uploaded the cut and absent until then — see
          `src/server/media.ts`. `FilmFrame` is complete either way: the frame
          runs the drawn placeholder reel rather than sitting black behind a
          label, because an empty player reads as broken.
        */}
        <FilmFrame src={src} label={videoLabel} captions={covers} openLabel="Watch it" />
      </MediaCell>

      {/* What the film covers, one cell each. Numbered, not timed: a timecode
          on a cut nobody has made yet is a promise that ages badly. */}
      <div className="grid-cells col-span-full grid grid-cols-2 md:grid-cols-4">
        {covers.map((item, i) => (
          <div key={item} className="cell justify-end gap-1.5 px-gutter py-3.5">
            <Label className="opacity-50">{String(i + 1).padStart(2, "0")}</Label>
            <span className="font-sans text-sm text-ink">{item}</span>
          </div>
        ))}
      </div>

      <div className="cell col-span-full">
        <NextCell next={next} />
      </div>
    </Panel>
  );
}
