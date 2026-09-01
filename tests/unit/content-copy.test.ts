import { describe, expect, it } from "vitest";
import { homeCopy } from "@/content/copy/home";
import { siteCopy } from "@/content/copy/site";
import { workCopy } from "@/content/copy/work";
import { aboutCopy } from "@/content/copy/about";
import { contactCopy } from "@/content/copy/contact";
import { blockRegistry } from "@/modules";

/**
 * Copy is the product here, not decoration. These guard the promises the brief
 * makes about it (docs/brief.md): no SaaS filler vocabulary, and no invented
 * statistics — on any route, since a new page is exactly where one of those
 * quietly gets broken.
 */

const BANNED = ["agentic", "leverage", "seamless", "cutting-edge", "robust"];

function allStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) allStrings(v, out);
  else if (value && typeof value === "object")
    for (const v of Object.values(value)) allStrings(v, out);
  return out;
}

const strings = allStrings([homeCopy, siteCopy, workCopy, aboutCopy, contactCopy]);

describe("site copy", () => {
  it("avoids the banned vocabulary", () => {
    for (const word of BANNED) {
      const offenders = strings.filter((s) => s.toLowerCase().includes(word));
      expect(offenders, `"${word}" appears in: ${offenders.join(" | ")}`).toEqual([]);
    }
  });

  it("makes no percentage or multiplier claims", () => {
    // Earlier drafts had "+40% demo bookings" metric tiles. They were cut on
    // purpose: every figure a visitor has read on an agency site was invented,
    // they know it, and a real one belongs in a case study.
    const offenders = strings.filter((s) => /[+-]?\d+(\.\d+)?\s*%|\b\d+x\b/i.test(s));
    expect(offenders).toEqual([]);
  });

  it("points every nav item at a route or a section that exists", () => {
    // Routes that have a page.tsx, and the anchors each one actually contains.
    // A link to `/about#expertise` is only valid if the about page is the one
    // carrying that section — exactly the thing that rots when a block moves.
    const routes: Record<string, string[]> = {
      "/": ["experience", "expertise", "playbook", "watch", "contact", "top"],
      "/work": ["experience", "how", "contact", "top"],
      "/about": ["expertise", "how-we-work", "contact", "top"],
      "/contact": ["before", "channels", "contact", "top"],
    };

    for (const item of siteCopy.nav) {
      const [path, fragment] = item.href.split("#");
      const route = path === "" ? "/" : path!;

      expect(Object.keys(routes), `${item.href} is not a route`).toContain(route);
      if (fragment) {
        expect(routes[route], `${item.href} is not a section of ${route}`).toContain(fragment);
      }
    }
  });

  it("keeps the hero headline as three separate lines", () => {
    // Where the headline breaks is a design decision, so it is data, not a
    // string the renderer is allowed to re-wrap.
    expect(homeCopy.hero.headlineLines).toHaveLength(3);
  });

  it("keeps every panel to a copy budget it can actually fit", () => {
    // A panel is exactly the band between the fixed bars and does not grow, so
    // copy is written to a length rather than trimmed afterwards. These are the
    // ceilings the layout was designed against; exceeding one means the section
    // overflows on a laptop rather than wrapping.
    expect(homeCopy.hero.subhead.length).toBeLessThanOrEqual(80);
    expect(homeCopy.experience.lead.length).toBeLessThanOrEqual(160);
    expect(homeCopy.experience.card.body.length).toBeLessThanOrEqual(200);
    expect(homeCopy.magnet.body.length).toBeLessThanOrEqual(200);
    expect(homeCopy.vsl.body.length).toBeLessThanOrEqual(160);
    for (const row of homeCopy.services.rows) {
      expect(row.detail.length, row.title).toBeLessThanOrEqual(180);
    }
  });

  it("hands every panel off to the one after it", () => {
    // The connective tissue. A reader is never at the foot of a section
    // wondering whether the page is over, and the indices run in order.
    const chain = [homeCopy.experience, homeCopy.services, homeCopy.magnet, homeCopy.vsl];
    for (const [i, section] of chain.entries()) {
      const following = chain[i + 1];
      expect(Number(section.next.index), section.eyebrow).toBe(Number(section.index) + 1);
      if (following) expect(section.next.index).toBe(following.index);
    }
  });

  it("puts the ask before the video", () => {
    // The funnel's whole argument. By the opt-in the reader has seen the cost,
    // one build, and the method; what is asked for is one field. Reversing
    // these two spends peak willingness on a four-minute commitment.
    expect(Number(homeCopy.magnet.index)).toBeLessThan(Number(homeCopy.vsl.index));
  });

  it("calls the case study an experience", () => {
    expect(homeCopy.experience.card.name).toBe("The Picasso Experience");
    expect(homeCopy.experience.card.client).toBe("faayy.shop");
    expect(strings.some((s) => /case stud(y|ies)/i.test(s))).toBe(false);
  });
});

describe("blockRegistry", () => {
  it("registers every block the routes place", () => {
    for (const id of [
      "hero-scribble",
      "index-list",
      "pillars",
      "page-header",
      "experience-feature",
      "services-rows",
      "prose-sections",
      "lead-magnet",
      "vsl-panel",
      "about-statement",
      "contact-footer",
    ]) {
      expect(Object.keys(blockRegistry)).toContain(id);
    }
  });

  it("gives every block an id matching its registry key", () => {
    for (const [key, definition] of Object.entries(blockRegistry)) {
      expect(definition.id).toBe(key);
    }
  });
});
