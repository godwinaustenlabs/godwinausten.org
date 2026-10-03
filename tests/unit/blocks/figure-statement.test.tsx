import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import FigureStatement from "@/modules/blocks/figure-statement";

const props = {
  index: "01",
  eyebrow: "What we look for",
  headline: "Bring something you made.",
  body: "Two odd things you finished tell us more than five ordinary ones you were assigned.",
  figure: "/assets/figure.svg",
  points: [
    {
      index: "01",
      title: "You make things unasked",
      detail: "Nobody here waits to be handed one.",
    },
    { index: "02", title: "You finish them", detail: "Starting is cheap." },
  ],
  next: { index: "02", label: "Open roles", href: "#roles" },
};

describe("figure-statement", () => {
  it("renders the claim, the list, and the hand-off", () => {
    render(<FigureStatement {...props} />);
    expect(screen.getByRole("heading", { level: 2, name: props.headline })).toBeInTheDocument();
    for (const point of props.points) {
      expect(screen.getByText(point.title)).toBeInTheDocument();
      expect(screen.getByText(point.detail)).toBeInTheDocument();
    }
    expect(screen.getByRole("link", { name: new RegExp(props.next.label) })).toHaveAttribute(
      "href",
      props.next.href,
    );
  });

  it("paints the figure as a mask rather than inlining it", () => {
    const { container } = render(<FigureStatement {...props} />);
    // 170 KB of path data in the markup would sit on the critical path of every
    // page that places this. As a mask it is one cached fetch and the block only
    // supplies a colour — the same trick the hero uses.
    const passes = container.querySelectorAll(`[style*="${props.figure}"]`);
    expect(passes.length).toBeGreaterThanOrEqual(2);
    for (const pass of passes) {
      expect(pass.getAttribute("style")).toContain("mask-image");
    }
  });

  it("re-frames the drawing instead of repeating the hero's", () => {
    const { container } = render(<FigureStatement {...props} />);
    // The same file under a different treatment: mirrored and tilted, and shown
    // whole rather than bled off an edge — that is the hero's device and doing
    // it twice is one effect rather than two drawings. A genuinely different
    // pose would need a second source image to trace (docs/adr/0004).
    const frame = container.querySelector('[class*="scaleX(-1)"]');
    expect(frame).toBeInTheDocument();
    expect(frame).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector('[style*="mask-size: contain"]')).toBeInTheDocument();
  });

  it("needs no JavaScript to draw the figure", () => {
    // The hero runs a rAF loop to lean at the cursor; this is two masked
    // elements and whatever drift the frame already publishes. A sub-route does
    // not pay for the landing page's interaction.
    const { container } = render(<FigureStatement {...props} />);
    expect(container.querySelector("canvas")).toBeNull();
    expect(container.querySelector("svg")).toBeNull();
  });
});
