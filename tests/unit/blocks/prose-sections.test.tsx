import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ProseSections from "@/modules/blocks/prose-sections";

const props = {
  index: "02",
  eyebrow: "How it was made",
  headline: "Four weeks, in order.",
  sections: [
    { index: "01", title: "We sat with the work first", paragraphs: ["One.", "Two."] },
    { index: "02", title: "Narrow agents", paragraphs: ["Three."] },
  ],
};

describe("prose-sections", () => {
  it("renders an ordered list of headed sections", () => {
    render(<ProseSections {...props} />);
    expect(screen.getByRole("heading", { level: 2, name: props.headline })).toBeInTheDocument();
    for (const section of props.sections) {
      expect(screen.getByRole("heading", { level: 3, name: section.title })).toBeInTheDocument();
      for (const paragraph of section.paragraphs) {
        expect(screen.getByText(paragraph)).toBeInTheDocument();
      }
    }
  });

  it("puts every section on the same seam", () => {
    const { container } = render(<ProseSections {...props} />);
    // One cell for the head plus one per section — the grid the whole site is
    // built on, even where the block is allowed to run taller than the band.
    expect(container.querySelector(".grid-cells")).toBeInTheDocument();
    expect(container.querySelectorAll(".cell")).toHaveLength(props.sections.length + 1);
  });
});
