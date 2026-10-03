import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Charter from "@/modules/blocks/charter";

const props = {
  index: "01",
  eyebrow: "Who we are",
  headline: "We exist to move the line on what is possible.",
  lead: ["Three things at once.", "The other two are why the first is any good."],
  figure: "/assets/plates/globe.jpg",
  backdrop: "/assets/plates/hands.png",
  sections: [
    {
      index: "01",
      title: "The laboratory is not a marketing department",
      paragraphs: ["Most of it has no customer and never will."],
      spotlight: false,
    },
    {
      index: "02",
      title: "The hundred-year plan",
      paragraphs: ["Build something that outlives everyone currently inside it."],
      spotlight: true,
    },
  ],
};

describe("charter", () => {
  it("states the ambition and then explains it in headed sections", () => {
    render(<Charter {...props} />);
    expect(screen.getByRole("heading", { level: 2, name: props.headline })).toBeInTheDocument();
    for (const paragraph of props.lead) expect(screen.getByText(paragraph)).toBeInTheDocument();
    for (const section of props.sections) {
      expect(screen.getByRole("heading", { level: 3, name: section.title })).toBeInTheDocument();
      for (const p of section.paragraphs) expect(screen.getByText(p)).toBeInTheDocument();
    }
  });

  it("lights the commitments instead of listing them in cards", () => {
    // They were a row of three cards under the prose: too short to say anything,
    // and a card is the one pattern this site does not have (the card test in
    // docs/brief.md). As spotlights they get more room, not less.
    const { container } = render(<Charter {...props} />);
    const cells = Array.from(container.querySelectorAll(".cell"));
    // Two for the masthead (the statement and the picture beside it), one per
    // plain section, and **one** for the whole lit run — the commitments share a
    // cell so they can share the photograph behind them.
    expect(cells).toHaveLength(4);
    // The masthead and the one spotlight are ink; the plain section is not.
    expect(container.querySelectorAll(".cell-ink")).toHaveLength(2);
  });

  it("goes dark, because it is the page's one landmark", () => {
    // `/about` otherwise runs paper from the masthead to the closing statement.
    const { container } = render(<Charter {...props} />);
    expect(container.querySelector(".cell-ink")).toBeInTheDocument();
  });

  it("drops the figure's cell rather than drawing an empty one", () => {
    const { container } = render(<Charter {...props} figure={undefined} />);
    expect(container.querySelector(`[style*="globe"]`)).toBeNull();
    // The masthead's own cell, the plain section, and the lit run.
    expect(container.querySelectorAll(".cell")).toHaveLength(3);
  });

  it("keeps the pictures out of the accessibility tree", () => {
    // They are what the statement is set over, not illustrations of anything a
    // reader needs described.
    const { container } = render(<Charter {...props} />);
    expect(container.querySelector(`[style*="globe"]`)).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector(`[style*="hands"]`)).toHaveAttribute("aria-hidden", "true");
  });

  it("lays one photograph under the whole lit run", () => {
    // Each cell paints its own ground, so three lit cells covered a shared
    // picture three times over. One cell, one ground, one backdrop — and the
    // three commitments told apart by a rule drawn *on* the picture rather than
    // by a seam the picture cannot cross.
    const { container } = render(<Charter {...props} />);
    const backdrop = container.querySelector(`[style*="hands"]`);
    // [0] is the masthead; [1] is the lit run.
    const run = container.querySelectorAll(".cell-ink")[1]!;
    expect(run.contains(backdrop)).toBe(true);
    for (const section of props.sections.filter((s) => s.spotlight)) {
      expect(run.textContent).toContain(section.title);
    }
  });
});
