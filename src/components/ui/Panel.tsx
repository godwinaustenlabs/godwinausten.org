import { cn } from "@/lib/utils";

/**
 * A panel — one section's worth of cell grid, sized to the chrome band.
 *
 * ## The rule this enforces
 *
 * There is a fixed bar at the top of the page and another at the bottom. A
 * panel occupies exactly what is left between them (`--band`) and **never more**.
 * Before this existed, sections set `min-h-[100svh]` and then added padding and
 * content on top, so they ran under the nav at the top and past the fold at the
 * bottom — the two layout complaints that prompted the rebuild.
 *
 * On the filmstrip that height is fixed, not a minimum: a panel with more
 * content than fits shortens its type or drops a cell, it does not grow. That
 * constraint is what keeps every section on the home page the same shape.
 *
 * In vertical flow a panel is as tall as its content. The band exists to stop a
 * section running under the chrome when the page cannot scroll to reveal the
 * rest; a vertical document has no such problem, and forcing every section to a
 * full screen only leaves voids.
 *
 * On the filmstrip a panel is also as wide as its `width` prop; in vertical
 * flow the width is ignored and it is simply the next section down.
 */
export function Panel({
  /** Filmstrip width, in viewport widths. Ignored in vertical flow. */
  width = 1,
  id,
  className,
  children,
}: {
  width?: number;
  /** DOM id, when a block owns an anchor its composition does not. */
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      className={cn(
        /*
         * Band-height on the filmstrip; content-height in vertical flow.
         *
         * The fixed height is what stops a panel running under the chrome when
         * the page is one screen wide and cannot scroll to reveal the rest. In
         * a vertical document there is nothing to protect against — the page
         * scrolls — and forcing every section to a full screen leaves a void
         * under any section with less than a screen of content, which is what
         * the sub-routes were doing.
         */
        "grid-cells w-full",
        "strip:h-full strip:w-[calc(var(--panel-width)*100vw)]",
        className,
      )}
      style={{ "--panel-width": width } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
