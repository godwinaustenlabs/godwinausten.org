import { BREAKPOINTS, type ResponsiveVisibility } from "../types";

/**
 * Turn a per-breakpoint visibility map into Tailwind classes.
 *
 * Visibility is a *class* toggle, not conditional rendering, on purpose: the
 * markup stays in the DOM so a block can be revealed by a breakpoint change or
 * a transition without remounting and losing its state.
 *
 * `{ base: false, md: true }` => "hidden md:block"
 */
export function visibilityClasses(
  visibility: ResponsiveVisibility | undefined,
  displayWhenVisible = "block",
): string {
  if (!visibility) return "";

  const out: string[] = [];
  let previous: boolean | undefined;

  for (const bp of BREAKPOINTS) {
    const value = visibility[bp];
    if (value === undefined || value === previous) continue;

    const cls = value ? displayWhenVisible : "hidden";
    out.push(bp === "base" ? cls : `${bp}:${cls}`);
    previous = value;
  }

  return out.join(" ");
}
