/** Single source of truth for site-wide identity. Imported by metadata + blocks. */
export const site = {
  name: "Godwin Austen Labs",
  domain: "godwinausten.org",
  description:
    "We build AI agents for sales, service and ops teams — wired into the tools you already use.",
  locale: "en_US",
  /** Where the team is. Not a city — the copy says "Pakistan". */
  place: "Pakistan",
  founded: "2024",
  email: {
    work: "hello@godwinausten.org",
    careers: "jobs@godwinausten.org",
  },
} as const;
