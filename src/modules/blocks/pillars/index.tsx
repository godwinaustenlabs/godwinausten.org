import { Label } from "@/components/ui/Label";
import { cn } from "@/lib/utils";
import type { PillarsProps } from "./block.config";

/**
 * Three tiles stating the shape of the thing, before any prose explains it.
 *
 * Read from oddcommon's `/expertise`, which opens on three blocks — People,
 * Craft, Experience — before a word of explanation. It works because a reader
 * arriving on a sub-route wants the shape of the answer immediately, and three
 * words give it faster than a paragraph can.
 *
 * The tones alternate so the row carries the page's colour rhythm rather than
 * reading as three identical boxes.
 */
export default function Pillars({ items }: PillarsProps) {
  return (
    <div className="grid-cells grid w-full md:grid-cols-3">
      {items.map((item, i) => (
        <div
          key={item.index}
          className={cn(
            "cell relative justify-between gap-10 overflow-hidden px-gutter py-[clamp(2rem,7vh,4rem)]",
            i % 2 === 1 && "cell-ink",
          )}
        >
          {/* Texture, not illustration: enough to give each tile a different
              temperature, not enough to read as a picture of anything. */}
          {item.photo ? (
            <div
              aria-hidden="true"
              /*
                Fully desaturated, and quieter than it was.
                
                Three tiles side by side each carrying a different texture is
                three things asking for attention behind three words that are
                the actual content. `grayscale-[0.4]` also left the wire
                photograph visibly coloured, which put reds and blues on a page
                whose palette is paper, ink and one lime.
              */
              className={cn(
                "pointer-events-none absolute inset-0 bg-cover bg-center grayscale",
                i % 2 === 1 ? "opacity-[0.16]" : "opacity-[0.09]",
              )}
              style={{ backgroundImage: `url(${item.photo})` }}
            />
          ) : null}

          <Label tone={i % 2 === 1 ? "paper" : "ink"} className="relative opacity-40">
            {item.index}
          </Label>

          <div className="relative">
            <h3
              className={cn(
                "font-display text-[clamp(1.75rem,3.6vw,3rem)] leading-[0.95] font-bold",
                i % 2 === 1 ? "text-paper" : "text-ink",
              )}
            >
              {item.title}
            </h3>
            <p
              className={cn(
                "mt-4 max-w-[30ch] font-sans text-base",
                i % 2 === 1 ? "text-paper/65" : "text-soft",
              )}
            >
              {item.detail}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
