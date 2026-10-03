import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VslPanel from "@/modules/blocks/vsl-panel";

const props = {
  index: "04",
  eyebrow: "The long version",
  headline: "The part where we convince you.",
  body: "The workflow we mapped, what we built, and what it costs to run.",
  videoLabel: "Demo reel",
  next: { index: "05", label: "Labs", href: "#labs" },
};

const comingSoon = {
  heading: "The developers are working on it.",
  body: "The film will be up shortly — come back in a few days.",
};

describe("vsl-panel while the film is still being cut", () => {
  it("shows a banner rather than a player, and says nothing is loading", () => {
    render(<VslPanel {...props} comingSoon={comingSoon} />);

    // The affordance is a button, not a <video>: there is nothing to play, and a
    // transport that scrubs a placeholder wastes the one click this panel gets.
    expect(screen.getByRole("button", { name: /Watch it/ })).toBeInTheDocument();
    expect(document.querySelector("video")).toBeNull();
  });

  it("explains itself when pressed, instead of doing nothing", async () => {
    const user = userEvent.setup();
    render(<VslPanel {...props} comingSoon={comingSoon} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Watch it/ }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveTextContent(/developers are working on it/i);
    expect(dialog).toHaveTextContent(/up shortly/i);
  });

  it("closes again, and leaves the page scrollable", async () => {
    const user = userEvent.setup();
    render(<VslPanel {...props} comingSoon={comingSoon} />);

    await user.click(screen.getByRole("button", { name: /Watch it/ }));
    expect(document.body.style.overflow).toBe("hidden");

    await user.click(screen.getByRole("button", { name: /Close/ }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    // A dialog that leaves `overflow: hidden` behind is a page that looks frozen.
    expect(document.body.style.overflow).not.toBe("hidden");
  });

  it("still renders the panel's own copy around it", () => {
    render(<VslPanel {...props} comingSoon={comingSoon} />);
    expect(screen.getByRole("heading", { name: props.headline })).toBeInTheDocument();
    expect(screen.getByText(props.body)).toBeInTheDocument();
  });
});

describe("vsl-panel once there is a film", () => {
  it("renders the real player when `comingSoon` is absent", () => {
    // The one assertion that matters for putting the film back: dropping the key
    // from the copy has to restore the player with no other change.
    render(<VslPanel {...props} src="/assets/film-placeholder.mp4" />);

    expect(document.querySelector("video")).not.toBeNull();
    expect(screen.queryByText(/developers are working on it/i)).not.toBeInTheDocument();
  });
});
