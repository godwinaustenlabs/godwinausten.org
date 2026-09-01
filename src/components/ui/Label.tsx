import { cn } from "@/lib/utils";

/**
 * The mono label — eyebrows, indices, captions, corner meta.
 *
 * This is the only "chrome" the design allows itself (docs/brief.md), so it is
 * one component rather than a class every block re-types: if the label style
 * changes, it changes in one place.
 */
export function Label({
  children,
  as: Tag = "span",
  tone = "soft",
  className,
}: {
  children: React.ReactNode;
  as?: "span" | "p" | "div" | "h2";
  tone?: "soft" | "ink" | "paper";
  className?: string;
}) {
  return (
    <Tag
      className={cn(
        "label",
        tone === "soft" && "text-soft",
        tone === "ink" && "text-ink",
        tone === "paper" && "text-paper",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
