import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ContactFooter from "@/modules/blocks/contact-footer";

const props = {
  index: "05",
  eyebrow: "Let's talk",
  headline: "Let's build something that works.",
  body: "Tell us what you're doing by hand that shouldn't be.",
  channels: [
    { label: "Work with us", email: "hello@godwinausten.org" },
    { label: "Careers", email: "jobs@godwinausten.org" },
  ],
  wordmark: "Godwin Austen Labs",
};

describe("contact-footer", () => {
  it("renders the message and leaves the nav to the site chrome", () => {
    render(<ContactFooter {...props} />);
    expect(screen.getByRole("heading", { level: 2, name: props.headline })).toBeInTheDocument();
    // The bottom nav is fixed chrome on every page now, not part of this block.
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("makes both addresses real mailto links", () => {
    render(<ContactFooter {...props} />);
    for (const channel of props.channels) {
      expect(screen.getByRole("link", { name: channel.email })).toHaveAttribute(
        "href",
        `mailto:${channel.email}`,
      );
    }
  });

  it("hides the cropped wordmark from assistive tech", () => {
    render(<ContactFooter {...props} />);
    // It is set huge and deliberately cut off by the panel edge — decoration,
    // and the real wordmark is already in the header.
    expect(screen.queryByText(props.wordmark)).toHaveAttribute("aria-hidden", "true");
  });
});
