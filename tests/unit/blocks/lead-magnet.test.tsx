import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LeadMagnet from "@/modules/blocks/lead-magnet";

const props = {
  index: "04",
  eyebrow: "Free guide",
  kicker: "Free, and actually useful",
  headline: "The worksheet we run on day one.",
  body: "The same worksheet we run on day one of every engagement.",
  cover: { title: "What to automate first", format: "PDF — 9 pages" },
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

  it("draws the guide as an object, with its title and format on it", () => {
    render(<LeadMagnet {...props} />);
    // The offer has to be legible as a *thing you receive* at a glance. As a
    // mono eyebrow and a sentence it read as another content section.
    expect(screen.getByText(props.cover.title)).toBeInTheDocument();
    expect(screen.getByText(props.cover.format)).toBeInTheDocument();
    expect(screen.getByText(props.kicker)).toBeInTheDocument();
  });

  it("makes the submit a filled block, not a text link", async () => {
    await openTheForm();
    // The page's one conversion, and the only filled accent on it.
    const button = screen.getByRole("button", { name: props.submit });
    expect(button.className).toContain("bg-signal");
  });

  it("carries a honeypot no real visitor can reach", async () => {
    const dialog = await openTheForm();
    const honeypot = dialog.querySelector('input[name="company"]');
    expect(honeypot).toHaveAttribute("tabindex", "-1");
    expect(honeypot?.closest('[aria-hidden="true"]')).not.toBeNull();
  });
});
