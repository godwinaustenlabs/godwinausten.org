import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import HeroScribble from "@/modules/blocks/hero-scribble";
import { getBlock } from "@/modules";

const props = {
  headlineLines: ["we build teams", "that never", "clock out."],
  subhead: "AI systems for sales, service & ops.",
  primary: { label: "See the work", href: "#experience" },
  secondary: { label: "Get the playbook", href: "#playbook" },
  place: "Lahore, PK",
  scrollHint: "Scroll",
  figure: "/assets/figure.svg",
};

describe("hero-scribble", () => {
  it("renders the headline as a single h1 across its lines", () => {
    render(<HeroScribble {...props} />);
    // Three visual lines, one heading — a screen reader should hear one
    // sentence, not three fragments.
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent("we build teamsthat neverclock out.");
  });

  it("links both calls to action at the destinations it was given", () => {
    render(<HeroScribble {...props} />);
    expect(screen.getByRole("link", { name: /See the work/ })).toHaveAttribute(
      "href",
      "#experience",
    );
    expect(screen.getByRole("link", { name: /Get the playbook/ })).toHaveAttribute(
      "href",
      "#playbook",
    );
  });

  it("paints the figure twice so it reads with depth", () => {
    const { container } = render(<HeroScribble {...props} />);
    // Two layers of the *same* asset at different scales and rates. Cutting the
    // trace into separate depth-plane files broke evenodd hole cancellation and
    // filled the hand in solid; this costs one fetch and renders correctly.
    expect(container.querySelectorAll("[data-layer]")).toHaveLength(2);
  });

  it("keeps the figure out of the accessibility tree", () => {
    const { container } = render(<HeroScribble {...props} />);
    // A drawing with no informational content. Announcing it would put an
    // unlabelled graphic between the eyebrow and the headline.
    expect(container.querySelector("[data-layer]")?.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("is one full-bleed composition, not a grid of cells", () => {
    const { container } = render(<HeroScribble {...props} />);
    // The only panel on the site outside the cell grid. Its job is to be a
    // single arresting image, and a seam through the middle would undo it — the
    // grid starts at section 01.
    expect(container.querySelector(".grid-cells")).toBeNull();
    expect(container.querySelector(".cell")).toBeNull();
  });

  it("rejects an empty headline at the schema boundary", () => {
    // Reached through the registry, not by importing block.config — a block's
    // internals are off-limits from outside the block, tests included.
    const schema = getBlock("hero-scribble")!.schema;
    expect(schema.safeParse(props).success).toBe(true);
    expect(schema.safeParse({ ...props, headlineLines: [] }).success).toBe(false);
  });
});
