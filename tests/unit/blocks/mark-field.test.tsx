import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import MarkField from "@/modules/blocks/mark-field";
import { getBlock } from "@/modules";

const props = {
  index: "05",
  eyebrow: "Labs",
  headline: "Make something wonderful.",
  body: "The other half of the company, with no revenue target on it.",
  note: "Send us your crazy ideas or work.",
  apply: { label: "Write to us", email: "jobs@godwinausten.org" },
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

  it("asks for the work before it gives the address", () => {
    render(<MarkField {...props} />);
    // Labs is not a vacancy. The line above the address asks for the work
    // rather than for an application, and a bare address with nothing over it
    // reads as a careers page.
    expect(screen.getByText(props.note)).toBeInTheDocument();
    const link = screen.getByRole("link", { name: new RegExp(props.apply.email) });
    expect(link).toHaveAttribute("href", `mailto:${props.apply.email}`);
  });

  it("keeps the watermark out of the accessibility tree", () => {
    // It repeats the motto in a decorative form. A screen reader announcing
    // "Make Something Crazyy" over the heading is noise, not atmosphere.
    const { container } = render(<MarkField {...props} />);
    const mark = container.querySelector("svg");
    expect(mark).toBeInTheDocument();
    expect(mark).toHaveAttribute("aria-hidden", "true");
  });

  it("renders in a vertical document as well as on the filmstrip", () => {
    /*
     * It used to be `stripOnly`, and correctly so: the panel was a cursor-lit
     * cloth, and a pointer-driven ornament with no pointer to drive it is dead
     * weight on a phone.
     *
     * The panel carries the company's other half and a way to apply to it now.
     * Neither of those needs a cursor, and hiding them from every phone visitor
     * was a consequence of what used to be drawn here rather than a decision
     * about the content.
     *
     * Read through the registry, not the block's own config: reaching into a
     * block's internals is what the lego-block contract forbids, and a test is
     * not exempt from it.
     */
    expect(getBlock("mark-field")?.defaults?.layout?.stripOnly).toBeUndefined();
  });
});
