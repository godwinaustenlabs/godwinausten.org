import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ServicesRows from "@/modules/blocks/services-rows";

const props = {
  index: "02",
  eyebrow: "How it gets built",
  headline: "Three ways we plug in.",
  rows: [
    { index: "01", title: "Workflow Mapping", detail: "We sit with the work first." },
    { index: "02", title: "Agent Swarms", detail: "Chat, voice, outbound." },
    { index: "03", title: "Systems Integration", detail: "Wired into the CRM you already use." },
  ],
  next: { index: "02", label: "How it gets built", href: "#expertise" },
  lattice: false,
};

describe("services-rows", () => {
  it("renders the section heading and every offering", () => {
    render(<ServicesRows {...props} />);
    expect(screen.getByRole("heading", { level: 2, name: props.headline })).toBeInTheDocument();
    for (const row of props.rows) {
      expect(screen.getByText(row.title)).toBeInTheDocument();
      expect(screen.getByText(row.detail)).toBeInTheDocument();
    }
  });

  it("gives each offering its own cell so the three line up against each other", () => {
    const { container } = render(<ServicesRows {...props} />);
    // The comparison is the point of the section, and it only works if the
    // eyebrow bars align, which they only do if each is its own cell.
    expect(container.querySelectorAll(".cell").length).toBeGreaterThanOrEqual(
      props.rows.length + 1,
    );
    for (const row of props.rows) {
      expect(screen.getByText(row.title).closest(".cell-bar")).not.toBeNull();
    }
  });

  it("only draws the lattice where a composition asks for it", () => {
    const { container, rerender } = render(<ServicesRows {...props} />);
    // The home page's one piece of ambient motion. On a sub-route the same
    // block carries a plain list of channels, where it would be decoration
    // with nothing to say.
    expect(container.querySelector("canvas")).toBeNull();

    rerender(<ServicesRows {...props} lattice />);
    expect(container.querySelector("canvas")).toBeInTheDocument();
  });

  it("hands off to the next section", () => {
    render(<ServicesRows {...props} />);
    // Every panel ends by naming what follows it. A section that simply stops
    // is what makes a scroll feel like a stack of unrelated pages.
    const handoff = screen.getByRole("link", { name: new RegExp(props.next.label) });
    expect(handoff).toHaveAttribute("href", props.next.href);
  });
});
