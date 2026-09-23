import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Reel } from "@/components/ui/Reel";

/**
 * The reel's degradation path, which became load-bearing when media moved to a
 * public origin (`docs/adr/0007-media-on-a-public-origin.md`).
 *
 * Nothing asks R2 any more whether the object is really at the key — that
 * question cost a binding read on every render and put the Worker back in the
 * path. The answer arrives instead as a failed request, here, and what it must
 * produce is the drawn loop the component already shows when there is no `src`
 * at all. If this test goes, an empty key becomes the browser's broken-media
 * glyph on three pages and nobody notices until a reader does.
 */
describe("Reel", () => {
  const SRC = "https://cdn.example.test/reels/rembrandt.mp4";

  it("plays the source it is given", () => {
    const { container } = render(<Reel label="1:12" src={SRC} />);
    expect(container.querySelector("video")).toHaveAttribute("src", SRC);
  });

  it("falls back to the drawn loop when the source fails to load", () => {
    const { container } = render(<Reel label="1:12" src={SRC} />);
    const video = container.querySelector("video");
    expect(video).not.toBeNull();

    fireEvent.error(video!);

    expect(container.querySelector("video")).toBeNull();
    expect(screen.getByText("1:12")).toBeInTheDocument();
  });

  it("recovers when a different source arrives", () => {
    // The failing URL is remembered, not a flag: a reel that failed once must
    // not be permanently dead if the composition hands it a new file.
    const { container, rerender } = render(<Reel label="1:12" src={SRC} />);
    fireEvent.error(container.querySelector("video")!);
    expect(container.querySelector("video")).toBeNull();

    rerender(<Reel label="1:12" src="https://cdn.example.test/reels/other.mp4" />);
    expect(container.querySelector("video")).not.toBeNull();
  });
});
