import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import AboutStatement from "@/modules/blocks/about-statement";

const props = {
  index: "03",
  eyebrow: "Who we are",
  headline: "Small team. Big appetite for automation.",
  body: "We're a handful of engineers who got tired of watching good people do repetitive work.",
  meta: "Est. 2024 — Lahore, PK",
};

describe("about-statement", () => {
  it("renders the statement and the plain meta line", () => {
    render(<AboutStatement {...props} />);
    expect(screen.getByRole("heading", { level: 2, name: props.headline })).toBeInTheDocument();
    expect(screen.getByText(props.body)).toBeInTheDocument();
    // A line of text, not a stat block. There is no number to read out here.
    expect(screen.getByText(props.meta)).toBeInTheDocument();
  });

  it("paints itself on ink so colour bleeds across the section seam", () => {
    const { container } = render(<AboutStatement {...props} />);
    // The only ink panel on a sub-route. Without it the page resets to paper at
    // every section and reads as a stack of repeated templates.
    expect(container.querySelector(".cell-ink")).toBeInTheDocument();
  });
});
