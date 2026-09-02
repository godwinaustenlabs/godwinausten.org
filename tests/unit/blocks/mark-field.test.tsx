import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import MarkField from "@/modules/blocks/mark-field";
import { getBlock } from "@/modules";

const props = {
  index: "05",
  eyebrow: "Who's behind it",
  headline: "We would rather be useful than impressive.",
  body: "A handful of engineers who like the unglamorous half of the work.",
  hint: "Move your cursor",
  next: { index: "06", label: "Talk to us", href: "#contact" },
};

describe("mark-field", () => {
  it("renders the claim and the hand-off", () => {
    render(<MarkField {...props} />);
    expect(screen.getByRole("heading", { level: 2, name: props.headline })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: new RegExp(props.next.label) })).toHaveAttribute(
      "href",
      props.next.href,
    );
  });

  it("tells the visitor the surface does something", () => {
    // Without the hint it is a static logo. Nobody moves a cursor over a page
    // to find out whether anything happens.
    render(<MarkField {...props} />);
    expect(screen.getByText(props.hint)).toBeInTheDocument();
  });

  it("renders the surface as a canvas, with nothing for a screen reader in it", () => {
    // The cloth is one fragment shader on one canvas — no images, no meshes,
    // nothing downloaded. It carries no information either, so it stays out of
    // the accessibility tree entirely.
    const { container } = render(<MarkField {...props} />);
    const surface = container.querySelector("canvas");
    expect(surface).toBeInTheDocument();
    expect(surface?.closest("[aria-hidden]")).toHaveAttribute("aria-hidden", "true");
  });

  it("is declared filmstrip-only, so the vertical document never renders it", () => {
    // A pointer-driven ornament with no pointer to drive it is dead weight on a
    // phone, and the funnel must not depend on anything that lives here.
    // Through the registry, not the block's own config: reaching into a
    // block's internals is exactly what the lego-block contract forbids, and a
    // test is not exempt from it.
    expect(getBlock("mark-field")?.defaults?.layout?.stripOnly).toBe(true);
  });
});
