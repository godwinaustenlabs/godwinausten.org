import { Label } from "@/components/ui/Label";
import { Panel } from "@/components/ui/Panel";
import { NextCell } from "@/components/ui/Cell";
import { ClothCanvas } from "./parts/ClothCanvas";
import type { MarkFieldProps } from "./block.config";

/**
 * Cloth, with the logomark pressed into it and a light you carry.
 *
 * A breath between the film and the ask — nothing to read, nothing to decide,
 * one thing to touch. It sits *after* the VSL on purpose: an ambient toy in
 * front of the opt-in would be a distraction from the only conversion on the
 * page, and behind it, it is a reward.
 *
 * The surface is one fragment shader — see `parts/ClothCanvas.tsx` for what it
 * does and what it deliberately does not download. This file is only the frame
 * around it: the eyebrow, the claim, and the hand-off to contact.
 *
 * `layout.stripOnly`, so the frame hides it in vertical flow. It is a
 * pointer-driven ornament: on a phone there is no cursor to carry the light, and
 * under reduced motion the page is in flow mode anyway, so this never renders
 * for a visitor who asked for stillness.
 */
export default function MarkField({ index, eyebrow, headline, body, hint, next }: MarkFieldProps) {
  return (
    <Panel width={1} className="grid-rows-[auto_1fr_auto]">
      <div className="cell col-span-full flex-row items-center gap-4 px-gutter py-3">
        <Label tone="ink" className="opacity-40">
          {index}
        </Label>
        <Label>{eyebrow}</Label>
      </div>

      <div className="cell relative overflow-hidden">
        <ClothCanvas />

        {/*
          The copy sits over the cloth rather than beside it. The shader keeps
          its folds gentle on the left — the mark is placed right of centre — so
          this reads on the surface without a scrim, and a scrim over fabric
          would flatten the one thing the section is for.
        */}
        <div className="relative flex h-full flex-col justify-between px-gutter py-[clamp(1.5rem,4vh,3rem)]">
          <div className="max-w-[26ch]">
            <h2 className="font-display text-[clamp(1.85rem,3.2vw,3.25rem)] leading-[0.95] font-bold text-ink">
              {headline}
            </h2>
            <p className="mt-5 max-w-[38ch] font-sans text-base text-soft">{body}</p>
          </div>
          <Label className="opacity-50">{hint}</Label>
        </div>
      </div>

      <div className="cell col-span-full">
        <NextCell next={next} />
      </div>
    </Panel>
  );
}
