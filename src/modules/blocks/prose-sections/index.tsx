import { Label } from "@/components/ui/Label";
import type { ProseSectionsProps } from "./block.config";

/**
 * Numbered prose sections.
 *
 * The block the sub-routes are mostly made of. The home page argues in panels
 * that are each exactly one screen; these pages *explain*, and explanation
 * needs room to run — so this is the one block allowed to be taller than the
 * band. It only ever appears on a vertical route, where a reader scrolls at
 * their own pace and a fixed height would be a cage.
 *
 * It still obeys the grid: every section is a cell on the same seam, its number
 * sits where a cell's index always sits, and the prose is held to a readable
 * measure rather than filling the width.
 */
export default function ProseSections({ index, eyebrow, headline, sections }: ProseSectionsProps) {
  return (
    <div className="grid-cells grid w-full">
      <div className="cell">
        <div className="cell-bar border-b border-hairline">
          <Label tone="ink" className="opacity-40">
            {index}
          </Label>
          <Label>{eyebrow}</Label>
        </div>
        {headline ? (
          <div className="cell-body py-[clamp(2.5rem,7vh,4.5rem)]">
            <h2 className="max-w-[18ch] font-display text-[clamp(1.9rem,4.4vw,4rem)] leading-[0.94] font-bold text-ink">
              {headline}
            </h2>
          </div>
        ) : null}
      </div>

      {sections.map((section) => (
        <div key={section.index} className="cell">
          <div className="flex flex-col gap-4 px-gutter py-[clamp(2rem,5vh,3rem)] md:flex-row md:gap-14">
            <Label tone="ink" className="shrink-0 pt-2 opacity-30 md:w-14">
              {section.index}
            </Label>

            <div className="max-w-[62ch]">
              <h3 className="font-display text-[clamp(1.35rem,2.8vw,2.25rem)] leading-[1.05] font-medium text-ink">
                {section.title}
              </h3>
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-4 font-sans text-base leading-relaxed text-soft lg:text-lg"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
