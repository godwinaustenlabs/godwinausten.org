import { cn } from "@/lib/utils";

/**
 * Corner registration marks — four small "+" ticks inset from the edges.
 *
 * Read from docs/inspiration/raw/07-liminal-brand-board.jpg (REFERENCE). They
 * do the job a card border would do — telling the eye where a region begins —
 * without drawing a box, which is the thing this design explicitly refuses.
 *
 * Purely decorative and always `aria-hidden`.
 */
export function Ticks({ className, inset = "1.25rem" }: { className?: string; inset?: string }) {
  const positions = [
    { top: inset, left: inset },
    { top: inset, right: inset },
    { bottom: inset, left: inset },
    { bottom: inset, right: inset },
  ];

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 text-hairline", className)}
    >
      {positions.map((style, i) => (
        <span key={i} className="tick absolute size-2.5" style={style} />
      ))}
    </div>
  );
}
