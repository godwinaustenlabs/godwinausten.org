import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import LeadMagnet from "@/modules/blocks/lead-magnet";

const props = {
  index: "04",
  eyebrow: "Free guide",
  kicker: "Free, and actually useful",
  headline: "The worksheet we run on day one.",
  body: "The same worksheet we run on day one of every engagement.",
  contents: ["The four questions", "How to price a task", "Three failure modes"],
  cover: { title: "What to automate first", format: "PDF — 9 pages" },
  placeholder: "you@company.com",
  submit: "Send me the guide",
  micro: "One email. No call.",
  success: "On its way.",
  successBody: "Check your inbox.",
  anchor: "playbook",
  next: { index: "02", label: "How it gets built", href: "#expertise" },
};

describe("lead-magnet", () => {
  it("carries the anchor the hero's link targets", () => {
    const { container } = render(<LeadMagnet {...props} />);
    expect(container.querySelector("#playbook")).toBeInTheDocument();
  });

  it("labels the email field and requires it", () => {
    render(<LeadMagnet {...props} />);
    const field = screen.getByLabelText(props.placeholder);
    expect(field).toHaveAttribute("type", "email");
    expect(field).toBeRequired();
  });

  it("lists what is actually in the guide", () => {
    render(<LeadMagnet {...props} />);
    // "A free guide" is worth nothing; three specific things someone will learn
    // is worth an email address.
    for (const item of props.contents) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
  });

  it("draws the guide as an object, with its title and format on it", () => {
    render(<LeadMagnet {...props} />);
    // The offer has to be legible as a *thing you receive* at a glance. As a
    // mono eyebrow and a sentence it read as another content section.
    expect(screen.getByText(props.cover.title)).toBeInTheDocument();
    expect(screen.getByText(props.cover.format)).toBeInTheDocument();
    expect(screen.getByText(props.kicker)).toBeInTheDocument();
  });

  it("makes the submit a filled block, not a text link", () => {
    render(<LeadMagnet {...props} />);
    // The page's one conversion, and the only filled accent on it.
    const button = screen.getByRole("button", { name: props.submit });
    expect(button.className).toContain("bg-signal");
  });

  it("carries a honeypot no real visitor can reach", () => {
    const { container } = render(<LeadMagnet {...props} />);
    const honeypot = container.querySelector('input[name="company"]');
    expect(honeypot).toHaveAttribute("tabindex", "-1");
    expect(honeypot?.closest('[aria-hidden="true"]')).not.toBeNull();
  });
});
