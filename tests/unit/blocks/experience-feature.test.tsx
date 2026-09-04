import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ExperienceFeature from "@/modules/blocks/experience-feature";

const card = {
  eyebrow: "An experience",
  client: "faayy.shop",
  name: "The Picasso Experience",
  body: "Narrow agents that write the listings and answer what the catalogue can answer.",
  notes: [
    { label: "Shape", value: "Catalogue, support, escalation" },
    { label: "Status", value: "In production" },
  ],
  videoLabel: "1:12",
  cta: { label: "Read the full experience", href: "/work" },
};

const props = {
  index: "01",
  eyebrow: "Proof",
  headline: "We have shipped this.",
  lead: "A system doing real work inside a real company.",
  card,
  next: { index: "02", label: "How it gets built", href: "#expertise" },
};

describe("experience-feature", () => {
  it("leads with the claim and backs it with one card", () => {
    render(<ExperienceFeature {...props} />);
    expect(screen.getByRole("heading", { level: 2, name: props.headline })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: /The Picasso Experience/ }),
    ).toBeInTheDocument();
  });

  it("links the whole card through to the full write-up", () => {
    render(<ExperienceFeature {...props} />);
    // The card is the link, not a button inside it. One build does not need a
    // call to action of its own on a landing page — the detail is on /work.
    expect(screen.getByRole("link", { name: /The Picasso Experience/ })).toHaveAttribute(
      "href",
      card.cta.href,
    );
  });

  it("shows the placeholder reel until real footage is supplied", () => {
    const { container } = render(<ExperienceFeature {...props} />);
    expect(screen.getByText(card.videoLabel)).toBeInTheDocument();
    expect(container.querySelector("video")).toBeNull();
  });

  it("mounts a muted looping video once a src arrives", () => {
    const { container } = render(
      <ExperienceFeature {...props} card={{ ...card, src: "/picasso.mp4" }} />,
    );
    const video = container.querySelector("video");
    expect(video).toHaveAttribute("src", "/picasso.mp4");
    expect(video).toHaveProperty("muted", true);
    expect(video).toHaveAttribute("preload", "none");
  });

  it("shows the clip at 16:9 in every mode", () => {
    const { container } = render(<ExperienceFeature {...props} />);
    // Footage is 16:9 and is shown at 16:9 everywhere on this site. The cell
    // used to take the leftover height on the filmstrip and crop the frame to
    // whatever shape that produced; now the ratio is fixed and the notes below
    // absorb the difference. The picture is the evidence, the notes are the
    // caption, and if anything gives it should be the caption.
    const media = container.querySelector('[class*="aspect-video"]');
    expect(media).toBeInTheDocument();
    expect(media?.className).not.toContain("aspect-auto");
  });

  it("holds the placeholder reel still until the pointer arrives", () => {
    const { container } = render(<ExperienceFeature {...props} />);
    // A thumbnail looping permanently beside a paragraph competes with it; one
    // that starts when you look at it is an invitation.
    const paused = container.querySelector('[class*="animation-play-state:paused"]');
    expect(paused).toBeInTheDocument();
    expect(paused!.className).toContain("group-hover:[animation-play-state:running]");
  });

  it("hands off to the next section", () => {
    render(<ExperienceFeature {...props} />);
    expect(screen.getByRole("link", { name: new RegExp(props.next.label) })).toHaveAttribute(
      "href",
      props.next.href,
    );
  });
});
