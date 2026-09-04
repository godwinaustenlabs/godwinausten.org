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
  display: "columns" as const,
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

  it("sets the claim, not the category, as the thing you read first", () => {
    // `title` names the offering — "Workflow Mapping" — which any agency could
    // write. The claim is the position under it, and it is the reason someone
    // reads the paragraph. It carries the heading, so it wins the reading order
    // even though the eyebrow sits physically above it.
    const withClaims = {
      ...props,
      rows: props.rows.map((row, i) => ({ ...row, claim: `Claim number ${i}.` })),
    };
    render(<ServicesRows {...withClaims} />);
    for (let i = 0; i < props.rows.length; i += 1) {
      expect(
        screen.getByRole("heading", { level: 3, name: `Claim number ${i}.` }),
      ).toBeInTheDocument();
    }
  });

  it("leaves the cell alone when a composition supplies no claim", () => {
    // Optional on purpose: /about runs the same block as a plain list, where a
    // claim per row would be three assertions about nothing.
    render(<ServicesRows {...props} />);
    expect(screen.queryAllByRole("heading", { level: 3 })).toHaveLength(0);
  });

  it("spends the accent once per claim and nowhere else", () => {
    // Lime is the site's one accent and the brief rations it. One rule per
    // claim is the whole budget for this section — see docs/brief.md.
    const withClaims = {
      ...props,
      rows: props.rows.map((row) => ({ ...row, claim: "A claim." })),
    };
    const { container } = render(<ServicesRows {...withClaims} />);
    expect(container.querySelectorAll(".bg-signal")).toHaveLength(props.rows.length);
  });

  it("hands off to the next section", () => {
    render(<ServicesRows {...props} />);
    // Every panel ends by naming what follows it. A section that simply stops
    // is what makes a scroll feel like a stack of unrelated pages.
    const handoff = screen.getByRole("link", { name: new RegExp(props.next.label) });
    expect(handoff).toHaveAttribute("href", props.next.href);
  });
});
