import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VslPanel from "@/modules/blocks/vsl-panel";
import { sliderProgressToTime, timeToSliderProgress } from "@/components/ui/FilmFrame";

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

  it("opens the theatre directly to the single video without a chooser", async () => {
    const user = userEvent.setup();
    render(<VslPanel {...props} src="/assets/film-placeholder.mp4" />);

    await user.click(screen.getByRole("button", { name: /Watch it/ }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    // The video is mounted immediately inside the dialog: no selection UI
    const dialogVideo = dialog.querySelector("video");
    expect(dialogVideo).not.toBeNull();
    expect(dialogVideo).toHaveAttribute("src", "/assets/film-placeholder.mp4");

    // Transport buttons are present
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Back 5 seconds/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Forward 5 seconds/ })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Seek" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("closes the theatre and cleans up overflow", async () => {
    const user = userEvent.setup();
    render(<VslPanel {...props} src="/assets/film-placeholder.mp4" />);

    await user.click(screen.getByRole("button", { name: /Watch it/ }));
    expect(document.body.style.overflow).toBe("hidden");

    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).not.toBe("hidden");
  });
});

describe("non-linear progress scrubber", () => {
  const duration = 120; // 2 minutes

  it("moves comparatively faster in the beginning than the end", () => {
    // Progress at quarter intervals
    const s0 = timeToSliderProgress(0, duration);
    const s25 = timeToSliderProgress(0.25 * duration, duration);
    const s50 = timeToSliderProgress(0.5 * duration, duration);
    const s75 = timeToSliderProgress(0.75 * duration, duration);
    const s100 = timeToSliderProgress(duration, duration);

    expect(s0).toBe(0);
    expect(s100).toBe(1);

    // Delta in the first quarter vs delta in the last quarter
    const firstQuarterDelta = s25 - s0;
    const lastQuarterDelta = s100 - s75;

    // The slider must move faster in the beginning than at the end
    expect(firstQuarterDelta).toBeGreaterThan(lastQuarterDelta * 1.5);

    // By halfway through the video, the slider should be noticeably past 50%
    expect(s50).toBeGreaterThan(0.6);
  });

  it("roundtrips cleanly between time and slider progress", () => {
    const testTimes = [0, 5, 15, 30, 60, 90, 115, 120];
    for (const t of testTimes) {
      const slider = timeToSliderProgress(t, duration);
      const recoveredTime = sliderProgressToTime(slider, duration);
      expect(recoveredTime).toBeCloseTo(t, 4);
    }
  });

  it("clamps safely at bounds and handles invalid duration", () => {
    expect(timeToSliderProgress(-10, duration)).toBe(0);
    expect(timeToSliderProgress(200, duration)).toBe(1);
    expect(timeToSliderProgress(10, 0)).toBe(0);
    expect(timeToSliderProgress(10, -5)).toBe(0);

    expect(sliderProgressToTime(-0.5, duration)).toBe(0);
    expect(sliderProgressToTime(1.5, duration)).toBe(duration);
    expect(sliderProgressToTime(0.5, 0)).toBe(0);
  });
});
