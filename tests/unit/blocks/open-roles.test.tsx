import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import OpenRoles from "@/modules/blocks/open-roles";

const apply = {
  label: "Apply —",
  email: "jobs@godwinausten.org",
  note: "Attach a CV and one thing you made",
};

const terms = {
  title: "What these pay, before you read any further",
  detail: "These two seats are voluntary and commission-based. There is no basic salary.",
};

const closed = {
  title: "Nothing open at the moment.",
  detail: "This is the board's usual state and it is not a polite no.",
};

const props = {
  index: "02",
  eyebrow: "Open roles",
  headline: "What is open right now.",
  lead: "Both of these are internships.",
  apply,
  terms,
  closed,
  roles: [
    {
      index: "01",
      title: "Sales Intern",
      summary: "You build the lists the rest of the work runs on.",
      meta: ["Internship", "Pakistan"],
      groups: [
        { title: "What you'd do", items: ["Build lead sheets.", "Verify every address."] },
        { title: "What you need", items: ["Google Sheets, properly."] },
      ],
    },
    {
      index: "02",
      title: "Marketing Intern",
      summary: "You run the accounts and you make what goes on them.",
      meta: ["Internship", "Pakistan"],
      groups: [{ title: "What you'd do", items: ["Run Instagram and LinkedIn."] }],
    },
  ],
};

describe("open-roles", () => {
  it("renders a posting in full rather than a link to one", () => {
    render(<OpenRoles {...props} />);
    for (const role of props.roles) {
      expect(screen.getByRole("heading", { level: 3, name: role.title })).toBeInTheDocument();
      for (const group of role.groups) {
        for (const item of group.items) expect(screen.getByText(item)).toBeInTheDocument();
      }
    }
  });

  it("prefills the subject with the role so an application arrives sorted", () => {
    render(<OpenRoles {...props} />);
    // The whole of the applicant tracking this page has, and all it needs —
    // there is no database behind this site and adding one to receive a CV is
    // exactly the improvisation CLAUDE.md §5 forbids.
    const link = screen.getByRole("link", { name: /Sales Intern/ });
    expect(link).toHaveAttribute(
      "href",
      `mailto:${apply.email}?subject=${encodeURIComponent("Sales Intern")}`,
    );
  });

  it("states the terms before the first posting, not inside it", () => {
    // These seats carry no salary. Someone should meet that before they have
    // read a job description and started wanting it — a benefits line in each
    // posting is disclosure that is present and unread.
    render(<OpenRoles {...props} />);
    const heading = screen.getByRole("heading", { level: 3, name: terms.title });
    const firstRole = screen.getByRole("heading", { level: 3, name: "Sales Intern" });
    expect(heading.compareDocumentPosition(firstRole) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it("keeps the terms up even when nothing is open", () => {
    render(<OpenRoles {...props} roles={[]} />);
    expect(screen.getByRole("heading", { level: 3, name: terms.title })).toBeInTheDocument();
  });

  it("says so when the board is empty, instead of rendering nothing", () => {
    // The state this page is in most of the time. A bare board with no message
    // reads as a page that failed to load, and taking a filled role down has to
    // be deleting a content entry — never a code change, or it will not happen.
    render(<OpenRoles {...props} roles={[]} />);
    expect(screen.getByRole("heading", { level: 3, name: closed.title })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: apply.email })).toHaveAttribute(
      "href",
      `mailto:${apply.email}`,
    );
    expect(screen.queryByText(/Sales Intern/)).not.toBeInTheDocument();
  });

  it("counts the open roles in the section bar", () => {
    render(<OpenRoles {...props} />);
    expect(screen.getByText("2 open")).toBeInTheDocument();
  });

  it("keeps the board on the grid and the postings on it as cards", () => {
    const { container } = render(<OpenRoles {...props} />);
    // Three cells: the head, the board, and the footnote. The postings are
    // *inside* the board rather than being cells of their own — the one place on
    // the site a card is the right pattern, because a role comes and goes and a
    // full-bleed panel reads as architecture.
    expect(container.querySelector(".grid-cells")).toBeInTheDocument();
    expect(container.querySelectorAll(".cell")).toHaveLength(4);
    expect(container.querySelectorAll("article")).toHaveLength(props.roles.length);
  });

  it("draws no board at all when nothing is open", () => {
    const { container } = render(<OpenRoles {...props} roles={[]} />);
    // The head, the closed notice, and the footnote — and no empty card tray
    // between them.
    expect(container.querySelectorAll("article")).toHaveLength(0);
    expect(container.querySelectorAll(".neon-frame")).toHaveLength(0);
  });
});
