import { SiteLink } from "@/modules";
import { Label } from "@/components/ui/Label";
import { Reel } from "@/components/ui/Reel";
import type { IndexListProps } from "./block.config";

/**
 * A list of work, in the index form oddcommon's `/work` uses.
 *
 * A **list, not a grid**. A grid of thumbnails asks the reader to choose before
 * they know anything; a list gives each entry a title, a sentence, and its
 * metadata, so they can tell whether it is relevant without opening it. It also
 * degrades honestly when there is only one entry, which a grid does not.
 *
 * Every row carries `client:` and `services:` in mono, which is the detail that
 * makes an index read as a record rather than as marketing — it is the same
 * information a studio would put on an invoice.
 *
 * The heading is set with a trailing slash ("Selected work /"), the convention
 * on the reference site for a section label that is not a sentence.
 */
export default function IndexList({ heading, entries }: IndexListProps) {
  return (
    <div className="grid-cells grid w-full">
      <div className="cell">
        <h2 className="px-gutter py-[clamp(2rem,6vh,3.5rem)] font-display text-[clamp(1.75rem,4vw,3.5rem)] leading-[0.95] font-bold text-ink">
          {heading}
        </h2>
      </div>

      {entries.map((entry) => (
        <SiteLink
          key={entry.index}
          href={entry.href}
          className="cell group px-gutter py-[clamp(2rem,6vh,3.5rem)] transition-colors hover:bg-hairline/30"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
            <Label tone="ink" className="shrink-0 pt-2 opacity-30 md:w-10">
              {entry.index}
            </Label>

            {/*
              The reel is the row.

              It used to be a 15rem thumbnail in a four-column row — index,
              thumbnail, copy, record — which made the one thing with a moving
              picture in it the smallest thing on the page. An index of builds
              that have shipped is a page about the builds; the footage is the
              claim and the prose is the caption, so it takes over half the row
              and holds a true 16:9 at every width.

              The record moved under the copy to pay for it. Three columns of
              text beside a wide frame is not a layout, it is two columns of
              text and a gutter.
            */}
            <div className="aspect-video w-full shrink-0 overflow-hidden md:w-[55%]">
              <Reel label={entry.runtime} src={entry.src} playOn="hover" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-display text-[clamp(1.5rem,3.4vw,2.75rem)] leading-[1.02] font-medium text-ink">
                {entry.title}
                <span
                  aria-hidden="true"
                  className="ms-3 inline-block text-signal transition-transform group-hover:translate-x-1"
                >
                  ↗
                </span>
              </h3>
              <p className="mt-4 max-w-[58ch] font-sans text-base leading-relaxed text-soft lg:text-lg">
                {entry.summary}
              </p>

              {/* The record. Mono, low contrast, and the same two fields on
                  every row — which is what makes a list of one still read as an
                  index. */}
              <dl className="mt-6 border-t border-hairline pt-5">
                <div className="flex flex-col gap-1.5">
                  <Label className="opacity-50">client:</Label>
                  <dd className="font-sans text-sm text-ink">{entry.client}</dd>
                </div>
                <div className="mt-5 flex flex-col gap-1.5">
                  <Label className="opacity-50">services:</Label>
                  <dd className="flex flex-wrap gap-x-3 gap-y-1.5">
                    {entry.services.map((service) => (
                      <span key={service} className="font-sans text-sm text-ink">
                        {service}
                      </span>
                    ))}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </SiteLink>
      ))}
    </div>
  );
}
