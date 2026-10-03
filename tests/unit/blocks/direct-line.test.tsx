import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import DirectLine from "@/modules/blocks/direct-line";

const props = {
  index: "02",
  eyebrow: "Where to send it",
  headline: "One address.",
  email: {
    address: "hello@godwinausten.org",
    note: "A workflow, and where it lives today",
  },
  whatsapp: {
    label: "WhatsApp",
    display: "+92 339 6146241",
    number: "923396146241",
    note: "If a thread is easier than an email",
  },
  notes: [
    { index: "01", title: "Nobody screens it", detail: "There is no assistant and no form." },
    {
      index: "02",
      title: "Looking for a job",
      detail: "That is a different page.",
      link: { label: "See open roles", href: "/careers" },
    },
  ],
};

describe("direct-line", () => {
  it("makes the address the largest thing on the panel", () => {
    render(<DirectLine {...props} />);
    // The whole reason this block replaced a `services-rows` list: the address
    // was set in the same 16px as the sentence explaining it.
    const link = screen.getByRole("link", { name: props.email.address });
    expect(link).toHaveAttribute("href", `mailto:${props.email.address}`);
    expect(link.className).toContain("font-display");
  });

  it("builds the WhatsApp link from the digits rather than taking a URL", () => {
    render(<DirectLine {...props} />);
    // The copy module supplies a number; the block supplies the host. A copy
    // module that could ship a URL is a copy module that can ship a wrong one.
    const link = screen.getByRole("link", { name: /WhatsApp/ });
    expect(link).toHaveAttribute("href", `https://wa.me/${props.whatsapp.number}`);
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  it("carries no vendor mark", () => {
    // `docs/adr/0008` — this repository never draws someone else's logo, and
    // there is no WhatsApp file in `scripts/logos/`. The glyph is a plain speech
    // bubble of our own and it is decorative.
    const { container } = render(<DirectLine {...props} />);
    const glyph = container.querySelector("svg");
    expect(glyph).toHaveAttribute("aria-hidden", "true");
  });

  it("points careers at its own page rather than at a second address", () => {
    const { container } = render(<DirectLine {...props} />);
    expect(screen.getByRole("link", { name: /See open roles/ })).toHaveAttribute(
      "href",
      "/careers",
    );
    // Exactly one `mailto:` on the panel. Offering a choice of addresses is what
    // made the old version a routing decision instead of an invitation, and
    // careers was one of the three being chosen between.
    expect(container.querySelectorAll('a[href^="mailto:"]')).toHaveLength(1);
  });
});
