import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import PageHeader from "@/modules/blocks/page-header";

const props = {
  eyebrow: "Selected work",
  headline: "Agents, in production.",
  lead: "Four systems doing work that used to sit in somebody's inbox.",
  meta: ["Lahore, PK", "Est. 2024"],
};

describe("page-header", () => {
  it("renders the headline as the page's h1", () => {
    render(<PageHeader {...props} />);
    // A sub-route's masthead is the top of its document outline; the home
    // page's hero is a different block precisely so there is never a second h1.
    expect(screen.getByRole("heading", { level: 1, name: props.headline })).toBeInTheDocument();
    expect(screen.getByText(props.lead)).toBeInTheDocument();
  });

  it("omits the lead and meta rule when it has neither", () => {
    const { container } = render(<PageHeader eyebrow="Who we are" headline="About." meta={[]} />);
    expect(container.querySelector("ul")).toBeNull();
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("shows a reel when one is supplied, and nothing when not", () => {
    const { container, rerender } = render(<PageHeader {...props} />);
    // Only the experience pages pass one — a page about one build should show
    // the build.
    expect(container.querySelector("canvas, video, [class*='aspect-']")).toBeNull();

    rerender(<PageHeader {...props} reel={{ runtime: "1:12" }} />);
    expect(screen.getByText("1:12")).toBeInTheDocument();
  });

  it("puts the meta line in cells of its own", () => {
    const { container } = render(<PageHeader {...props} />);
    // One cell for the masthead plus one per meta item, all on the same seam.
    expect(container.querySelectorAll(".cell")).toHaveLength(props.meta.length + 1);
  });
});
