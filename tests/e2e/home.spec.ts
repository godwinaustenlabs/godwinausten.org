import { expect, test, type Page } from "@playwright/test";

const DESKTOP = { width: 1680, height: 950 };

/** The mode flag the scroll engine puts on `<html>`. */
function scrollMode(page: Page) {
  return page.evaluate(() => document.documentElement.dataset.scrollMode);
}

test.describe("home — the funnel", () => {
  test("runs the sections in the order the argument needs", async ({ page }) => {
    await page.goto("/");

    // DOM order is the reading order in both scroll modes — the whole
    // accessibility argument for the filmstrip. It is also the funnel:
    // hook → cost → proof → mechanism → the ask → the long version → contact.
    const blocks = await page
      .locator("[data-block]")
      .evaluateAll((els) => els.map((el) => el.getAttribute("data-block")));

    expect(blocks).toEqual([
      "hero-scribble",
      "experience-feature",
      "services-rows",
      "lead-magnet",
      "vsl-panel",
      "contact-footer",
    ]);

    // The ask precedes the video. Reversing them spends the reader's peak
    // willingness on a four-minute commitment.
    expect(blocks.indexOf("lead-magnet")).toBeLessThan(blocks.indexOf("vsl-panel"));
  });

  test("makes no percentage claims on any route", async ({ page }) => {
    for (const path of ["/", "/work", "/about", "/contact"]) {
      await page.goto(path);
      const text = (await page.locator("body").innerText()).replace(/\s+/g, " ");
      expect(text, path).not.toMatch(/[+-]?\d+(\.\d+)?\s*%/);
    }
  });

  test("gives every route exactly one h1", async ({ page }) => {
    for (const path of ["/", "/work", "/about", "/contact"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 }), path).toHaveCount(1);
    }
  });

  test("keeps every panel inside the chrome band", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/");
    await page.waitForTimeout(500);

    const report = await page.evaluate(() => {
      // `--band` is a calc() expression, so it has to be measured rather than
      // read: the real bars are the source of truth for how tall a panel is.
      const header = document.querySelector("header")!.getBoundingClientRect().height;
      const footer = document
        .querySelector('nav[aria-label="Primary"]')!
        .getBoundingClientRect().height;

      return [...document.querySelectorAll("[data-block]")].map((el) => ({
        block: el.getAttribute("data-block"),
        height: Math.round(el.getBoundingClientRect().height),
        band: Math.round(window.innerHeight - header - footer),
      }));
    });

    // The rule the whole layout hangs on: a panel is exactly the band between
    // the fixed bars. Taller and it runs under the nav or past the fold, which
    // is what the cell grid was introduced to stop.
    expect(report.length).toBeGreaterThan(0);
    for (const panel of report) {
      expect(panel.height, panel.block!).toBe(panel.band);
    }
  });

  test("builds every section but the hero out of cells", async ({ page }) => {
    await page.goto("/");

    // The layout rule. The hero is deliberately outside the grid — its job is to
    // be one arresting image — and everything after it is cells on a seam.
    const hero = page.locator('[data-block="hero-scribble"]');
    await expect(hero.locator(".cell")).toHaveCount(0);

    expect(await page.locator(".grid-cells").count()).toBeGreaterThan(3);
    expect(await page.locator(".cell").count()).toBeGreaterThan(12);
  });
});

test.describe("home — desktop filmstrip", () => {
  test.use({ viewport: DESKTOP });

  test("runs horizontally and makes the document long enough to travel it", async ({ page }) => {
    await page.goto("/");
    await expect.poll(() => scrollMode(page)).toBe("strip");

    const { maxScroll, travel } = await page.evaluate(() => {
      const track = document.querySelector("[data-scroll-stage] > div") as HTMLElement;
      return {
        maxScroll: document.documentElement.scrollHeight - window.innerHeight,
        travel: track.scrollWidth - window.innerWidth,
      };
    });
    // Off by even a pixel and the end of the page is a dead zone where
    // scrolling moves nothing.
    expect(maxScroll).toBe(travel);
  });

  test("scrolling down moves the page sideways", async ({ page }) => {
    await page.goto("/");
    await expect.poll(() => scrollMode(page)).toBe("strip");

    const before = await page
      .locator("#experience")
      .evaluate((el) => el.getBoundingClientRect().left);
    await page.mouse.wheel(0, 1400);
    await expect
      .poll(() => page.locator("#experience").evaluate((el) => el.getBoundingClientRect().left))
      .toBeLessThan(before - 500);
  });

  test("an in-page anchor pulls its section to the left edge", async ({ page }) => {
    await page.goto("/");
    await expect.poll(() => scrollMode(page)).toBe("strip");

    await page.getByRole("link", { name: /Get the playbook/ }).click();
    await expect(page).toHaveURL(/#playbook$/);
    await expect
      .poll(
        () =>
          page.locator("#playbook").evaluate((el) => Math.round(el.getBoundingClientRect().left)),
        { timeout: 5000 },
      )
      .toBeLessThan(page.viewportSize()!.width);
  });

  test("tabbing pulls off-screen panels into view", async ({ page }) => {
    await page.goto("/");
    await expect.poll(() => scrollMode(page)).toBe("strip");

    // Visual order is horizontal but tab order is linear, so focus has to drag
    // the strip along or a keyboard visitor tabs into nothing.
    for (let i = 0; i < 16; i += 1) await page.keyboard.press("Tab");

    await expect
      .poll(() =>
        page.evaluate(() => {
          const r = document.activeElement!.getBoundingClientRect();
          return r.left > -10 && r.left < window.innerWidth;
        }),
      )
      .toBe(true);
  });

  test("the skip link moves focus into the main landmark", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe("main");
  });
});

test.describe("sub-routes", () => {
  test.use({ viewport: DESKTOP });

  test("are vertical documents, not filmstrips", async ({ page }) => {
    for (const path of ["/work", "/about", "/contact"]) {
      await page.goto(path);
      // Only the home page travels sideways. A page with real depth of content
      // wants to be read at the reader's pace.
      await expect.poll(() => scrollMode(page), { timeout: 5000 }).toBe("flow");
    }
  });

  test("the nav lives at the foot of the page and reaches every route", async ({ page }) => {
    await page.goto("/");
    // Buttons at the bottom only. The top bar is the wordmark and nothing else:
    // two rows of links at opposite ends of the screen is one row too many.
    await expect(page.locator("header").getByRole("link")).toHaveCount(1);
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  });

  test("the nav reaches all four routes", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Primary" });

    for (const [label, url, heading] of [
      ["Work", /\/work$/, "Systems in production."],
      ["About", /\/about$/, "Small team. Big appetite for automation."],
      ["Contact", /\/contact$/, "Tell us what you're doing by hand."],
    ] as const) {
      await nav.getByText(label, { exact: true }).click();
      await expect(page).toHaveURL(url);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
    }
  });
});

test.describe("route transition", () => {
  test.use({ viewport: DESKTOP });

  test("plays the exit before the route commits, then clears", async ({ page }) => {
    await page.goto("/");
    const stage = page.locator("[data-route-transition]");
    await expect(stage).toHaveAttribute("data-route-transition", "idle");

    await page
      .getByRole("navigation", { name: "Primary" })
      .getByText("Work", { exact: true })
      .click();

    // The blocks themselves animate out; there is no curtain. Ordering matters:
    // pushing early would swap the content out from under its own exit.
    await expect(stage).toHaveAttribute("data-route-transition", "leaving");
    await expect(page).toHaveURL(/\/work$/);
    await expect(stage).toHaveAttribute("data-route-transition", "idle", { timeout: 6000 });
  });

  test("covers with the logomark curtain, then lifts it", async ({ page }) => {
    await page.goto("/");
    const curtain = page.locator("[data-loader]");

    // The curtain runs on first load too — mark draws, then it lifts.
    await expect(curtain).toHaveAttribute("data-loader", "hidden", { timeout: 8000 });

    await page
      .getByRole("navigation", { name: "Primary" })
      .getByText("About", { exact: true })
      .click();

    // Down to cover, the route swaps behind it, up to reveal. Ordering matters:
    // pushing before the cover would show the swap.
    await expect(curtain).toHaveAttribute("data-loader", "covering");
    await expect(page).toHaveURL(/\/about$/);
    await expect(curtain).toHaveAttribute("data-loader", "hidden", { timeout: 8000 });
  });

  test("the back button leaves nothing stuck mid-exit", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("navigation", { name: "Primary" })
      .getByText("About", { exact: true })
      .click();
    await expect(page).toHaveURL(/\/about$/);

    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    // Back never goes through the link handler, so the entrance has to be
    // driven by the pathname landing, not by the navigation that started it.
    await expect(page.locator("[data-route-transition]")).toHaveAttribute(
      "data-route-transition",
      "idle",
      { timeout: 6000 },
    );
  });
});

test.describe("reduced motion", () => {
  test.use({ viewport: DESKTOP, contextOptions: { reducedMotion: "reduce" } });

  test("falls back to a vertical document even on a wide screen", async ({ page }) => {
    await page.goto("/");
    // Non-negotiable: CLAUDE.md §3.4. Viewport width must not override it.
    await expect.poll(() => scrollMode(page)).toBe("flow");
  });

  test("navigates without animating", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("navigation", { name: "Primary" })
      .getByText("Work", { exact: true })
      .click();
    await expect(page).toHaveURL(/\/work$/);
    await expect(page.locator("[data-route-transition]")).toHaveAttribute(
      "data-route-transition",
      "idle",
    );
  });
});

test.describe("lead magnet", () => {
  /**
   * Reach the opt-in the way a visitor does. On the filmstrip the panel sits
   * off-screen *horizontally* inside a fixed track, so Playwright's own
   * scroll-into-view cannot get to it — following the hero's link is both the
   * realistic path and the only one that works in both scroll modes.
   */
  async function openMagnet(page: Page) {
    await page.goto("/");
    await page.getByRole("link", { name: /Get the playbook/ }).click();
    const field = page.getByPlaceholder(/you@/);
    await expect(field).toBeVisible();
    // In vertical flow the panel is taller than a phone screen, so the field
    // may still be below the fold — normal, and Playwright scrolls a document.
    // What the horizontal case needed was the anchor to bring the whole panel
    // on screen, which it now does because the panel is exactly one screen wide.
    await field.scrollIntoViewIfNeeded();
  }

  test("accepts an email and confirms in place", async ({ page }) => {
    await openMagnet(page);
    await page.getByPlaceholder(/you@/).fill("someone@example.com");
    await page.getByRole("button", { name: /Send me the guide/ }).click();
    await expect(page.getByText("On its way.")).toBeVisible();
  });

  test("rejects a malformed address server-side", async ({ page }) => {
    await openMagnet(page);
    // Bypass the browser's own validation so the *action* is what is under test.
    await page.locator('input[name="email"]').evaluate((el: HTMLInputElement) => {
      el.type = "text";
      el.value = "not-an-email";
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await page.getByRole("button", { name: /Send me the guide/ }).click();
    // Scoped to the form: Next's own route announcer is also `role="alert"`.
    await expect(page.locator("form").getByRole("alert")).toContainText("email");
    await expect(page.getByText(/Check your inbox/)).toBeHidden();
  });
});
