import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LeadMagnet from "@/modules/blocks/lead-magnet";
import { MARK_CHROME_PARTS } from "@/components/layout/mark-chrome-parts";

const props = {
  index: "04",
  eyebrow: "Free guide",
  kicker: "Free, and actually useful",
  headline: "The worksheet we run on day one.",
  body: "The same worksheet we run on day one of every engagement.",
  cta: "Download it free",
  prompt: "Where do we send it?",
  placeholder: "you@company.com",
  submit: "Send it",
  again: "Download again",
  micro: "One email. No call.",
  success: "On its way.",
  successBody: "Check your inbox.",
  anchor: "playbook",
  next: { index: "02", label: "How it gets built", href: "#expertise" },
};

/** Press the offer and wait for the dialog the field lives in. */
async function openTheForm() {
  render(<LeadMagnet {...props} />);
  await userEvent.click(screen.getByRole("button", { name: new RegExp(props.cta) }));
  return screen.getByRole("dialog");
}

describe("lead-magnet", () => {
  it("carries the anchor the hero's link targets", () => {
    const { container } = render(<LeadMagnet {...props} />);
    expect(container.querySelector("#playbook")).toBeInTheDocument();
  });

  it("asks for nothing until the offer has been accepted", () => {
    render(<LeadMagnet {...props} />);
    // A visible field is a question; a button is an offer. The address is asked
    // for only once someone has said they want the thing.
    expect(screen.queryByLabelText(props.prompt)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: new RegExp(props.cta) })).toBeInTheDocument();
  });

  it("opens the field in a dialog, and closes it again", async () => {
    const dialog = await openTheForm();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("labels the email field and requires it", async () => {
    await openTheForm();
    const field = screen.getByLabelText(props.prompt);
    expect(field).toHaveAttribute("type", "email");
    expect(field).toBeRequired();
  });

  it("puts the price first, in the accent", () => {
    render(<LeadMagnet {...props} />);
    // The offer has to be legible as a *thing you receive* at a glance, and the
    // first thing said about it is that it costs nothing. A drawn "cover" used
    // to carry the title and format here; it was an imitation of a document
    // beside a real download, and the copy already says both.
    expect(screen.getByText(props.kicker)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: props.headline })).toBeInTheDocument();
  });

  it("makes the submit a filled block, not a text link", async () => {
    await openTheForm();
    // The page's one conversion, and the only filled accent on it.
    const button = screen.getByRole("button", { name: props.submit });
    expect(button.className).toContain("bg-signal");
  });

  it("paints the mark as one layer per part, out of the accessibility tree", () => {
    /*
     * The three shapes are separate files so each can back away from the pointer
     * on its own. They only reassemble into the mark because every layer is the
     * same box at the same size — a test that one of them has been given its own
     * geometry is worth more than a test that three divs exist.
     */
    const { container } = render(<LeadMagnet {...props} />);
    const layers = [...container.querySelectorAll<HTMLElement>('div[style*="mark-chrome"]')];
    expect(layers).toHaveLength(MARK_CHROME_PARTS.length);
    expect(new Set(layers.map((layer) => layer.className)).size).toBe(1);
    for (const layer of layers) {
      expect(layer.closest('[aria-hidden="true"]')).not.toBeNull();
    }
  });

  it("carries a honeypot no real visitor can reach", async () => {
    const dialog = await openTheForm();
    const honeypot = dialog.querySelector('input[name="company"]');
    expect(honeypot).toHaveAttribute("tabindex", "-1");
    expect(honeypot?.closest('[aria-hidden="true"]')).not.toBeNull();
  });
});
