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
      // A breath between the film and the ask. Present in the DOM at every
      // width — `stripOnly` hides it with `display`, so reading order is the
      // same document either way.
      "mark-field",
      "contact-footer",
    ]);

    // The ask precedes the video. Reversing them spends the reader's peak
    // willingness on a four-minute commitment.
    expect(blocks.indexOf("lead-magnet")).toBeLessThan(blocks.indexOf("vsl-panel"));

    // The ornament is filmstrip-only: a cursor-lit surface with no cursor to
    // light it is dead weight, and nothing in the funnel may depend on it.
    const shown = await page
      .locator('[data-block="mark-field"]')
      .evaluate((el) => getComputedStyle(el).display !== "none");
    expect(shown).toBe((await scrollMode(page)) === "strip");
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
    // A generous budget on purpose. This waits on an *eased* transform — the
    // strip lerps toward the anchor rather than jumping — and the suite runs
    // several browsers at once against one preview server. Five seconds passes
    // alone and times out under that contention, which says nothing about the
    // behaviour under test.
    await expect
      .poll(
        () =>
          page.locator("#playbook").evaluate((el) => Math.round(el.getBoundingClientRect().left)),
        { timeout: 15000 },
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

test.describe("the mark field", () => {
  test("keeps the light under the cursor while the panel slides beneath it", async ({ page }) => {
    // Straight to the section, because the surface deliberately does no work
    // while it is off screen — the light only tracks what a visitor can see.
    // Asserting from the top of the page would be measuring a loop that is
    // correctly asleep.
    await page.goto("/#who");
    // The engine stamps the mode after it mounts, so sampling it straight after
    // `goto` is a race — and losing that race silently *skips* this test rather
    // than failing it, which is the worst way to lose coverage.
    await page.waitForFunction(() => Boolean(document.documentElement.dataset.scrollMode));
    if ((await scrollMode(page)) !== "strip") test.skip();

    await page.locator('[data-block="mark-field"]').waitFor();
    await page.waitForTimeout(600);

    /** Where the lit circle actually is, in viewport coordinates. */
    const lightAt = () =>
      page.locator('[data-block="mark-field"] [style*="--mx"]').evaluate((el) => {
        const rect = el.getBoundingClientRect();
        const read = (name: string) => parseFloat((el as HTMLElement).style.getPropertyValue(name));
        return {
          x: rect.left + (read("--mx") / 100) * rect.width,
          y: rect.top + (read("--my") / 100) * rect.height,
          panelLeft: rect.left,
        };
      });

    // Park the cursor and leave it alone for the rest of the test.
    const CURSOR = { x: 900, y: 480 };
    await page.mouse.move(CURSOR.x, CURSOR.y, { steps: 10 });

    // Polled, not slept on. The light eases toward the cursor over a handful of
    // frames, and a fixed wait is a guess about how long that takes on a loaded
    // machine — which is exactly the kind of assumption that passes alone and
    // fails in a parallel run.
    await expect.poll(async () => Math.round((await lightAt()).x)).toBeCloseTo(CURSOR.x, -1);
    const before = await lightAt();

    // The half that was broken: no pointer event fires here at all. The panel
    // travels sideways under a still hand, and the light has to stay put on the
    // screen rather than riding along with the drawing.
    await page.mouse.wheel(0, 400);
    await expect
      .poll(async () => Math.round((await lightAt()).panelLeft))
      .toBeLessThan(before.panelLeft - 50);

    // Both axes polled, for the same reason the first one is: the chain eases
    // toward the cursor over a handful of frames, and how many milliseconds
    // that takes depends on what else the machine is doing. A bare `expect` on
    // the second axis was a fixed deadline hiding inside a polled test.
    await expect.poll(async () => Math.round((await lightAt()).x)).toBeCloseTo(CURSOR.x, -1);
    await expect.poll(async () => Math.round((await lightAt()).y)).toBeCloseTo(CURSOR.y, -1);
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
    /*
     * The field lives behind the CTA — one loud button, then one question — and
     * arrives in a dialog portalled to `<body>`. That portal is why nothing here
     * needs scrolling into view any more: the form is no longer inside the panel
     * at all, so neither the filmstrip's horizontal offset nor a phone's fold
     * can put it out of reach.
     */
    await page.getByRole("button", { name: /Download it free/ }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByPlaceholder(/you@/)).toBeVisible();
  }

  test("asks for nothing until the offer is accepted", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Get the playbook/ }).click();
    // A visible field is a question; a button is an offer.
    await expect(page.getByRole("button", { name: /Download it free/ })).toBeVisible();
    await expect(page.getByPlaceholder(/you@/)).toBeHidden();
  });

  test("accepts an email and confirms in place", async ({ page }) => {
    await openMagnet(page);
    await page.getByPlaceholder(/you@/).fill("someone@example.com");
    await page.getByRole("button", { name: /Send it/ }).click();
    await expect(page.getByText("Downloading now.")).toBeVisible();
  });

  test("rejects a malformed address server-side", async ({ page }) => {
    await openMagnet(page);
    // Bypass the browser's own validation so the *action* is what is under test.
    await page.locator('input[name="email"]').evaluate((el: HTMLInputElement) => {
      el.type = "text";
      el.value = "not-an-email";
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await page.getByRole("button", { name: /Send it/ }).click();
    // Scoped to the dialog's form: Next's own route announcer is also
    // `role="alert"`, and the dialog stays open on an error precisely so the
    // message lands next to the field that caused it.
    await expect(page.getByRole("dialog").locator("form").getByRole("alert")).toContainText(
      "email",
    );
    await expect(page.getByText("Downloading now.")).toBeHidden();
  });
});

test.describe("the film", () => {
  /**
   * Open the theatre the way a visitor does.
   *
   * `#watch` rather than a scroll: on the filmstrip the panel sits off-screen
   * horizontally inside a fixed track, and the anchor is the one route that
   * lands on it in both scroll modes — same reasoning as `openMagnet` above.
   */
  async function openTheatre(page: Page) {
    await page.goto("/#watch");
    await page.getByRole("button", { name: /Watch it/ }).click();
    const film = page.locator('div[role="dialog"] video');
    await expect(film).toBeAttached();
    // Metadata, not data: everything below is about the *transport*, and the
    // transport needs a duration before it can mean anything.
    await page.waitForFunction(
      () =>
        (document.querySelector('div[role="dialog"] video') as HTMLVideoElement)?.readyState >= 1,
    );
    return film;
  }

  const at = (film: ReturnType<typeof openTheatre> extends Promise<infer T> ? T : never) =>
    film.evaluate((el: HTMLVideoElement) => el.currentTime);

  test("plays, pauses and seeks before a real cut is uploaded", async ({ page }) => {
    const film = await openTheatre(page);

    /*
     * There is always something in the slot.
     *
     * Until the owner uploads a cut the media route serves the generated
     * stand-in (`npm run gen:placeholder-video`), and that is what makes this
     * test possible at all: with no `src` every control below is `disabled`,
     * so the transport could only ever have been checked by hand, once, by
     * whoever had a file lying around.
     */
    const duration = await film.evaluate((el: HTMLVideoElement) => el.duration);
    expect(duration).toBeGreaterThan(1);
    expect(Number.isFinite(duration)).toBe(true);

    // Autoplay-with-sound is a policy decision the browser makes, not one this
    // page can rely on, so settle the state rather than assuming it.
    const pause = page.getByRole("button", { name: "Pause" });
    if (await pause.isVisible()) await pause.click();
    await expect(page.getByRole("button", { name: "Play" })).toBeVisible();

    // Play: the clock has to actually move.
    const before = await at(film);
    await page.getByRole("button", { name: "Play" }).click();
    await expect.poll(() => at(film)).toBeGreaterThan(before + 0.3);

    // Pause: and then stop moving.
    await page.getByRole("button", { name: "Pause" }).click();
    const held = await at(film);
    await page.waitForTimeout(500);
    expect(await at(film)).toBeCloseTo(held, 1);

    // ±5s move five seconds, and back to where they started. Clamped at 0 and
    // at the runtime, so this walks down first to leave room to walk up.
    await page.getByRole("button", { name: "Back 5 seconds" }).click();
    await page.getByRole("button", { name: "Back 5 seconds" }).click();
    const low = await at(film);
    await page.getByRole("button", { name: "Forward 5 seconds" }).click();
    await expect.poll(() => at(film)).toBeCloseTo(low + 5, 1);
    await page.getByRole("button", { name: "Back 5 seconds" }).click();
    await expect.poll(() => at(film)).toBeCloseTo(low, 1);
  });

  test("the scrubber seeks where it is clicked", async ({ page }) => {
    const film = await openTheatre(page);
    const seek = page.getByRole("slider", { name: "Seek" });
    await expect(seek).toBeEnabled();

    /*
     * Clicked, not `fill()`-ed.
     *
     * A range input is a *pointer* control first, and its hit target used to be
     * the four pixels of the hairline it draws — visually right, and not
     * grabbable. Driving it with the mouse is the only version of this test
     * that would have failed then.
     */
    const box = (await seek.boundingBox())!;
    expect(box.height).toBeGreaterThan(16);
    await page.mouse.click(box.x + box.width * 0.6, box.y + box.height / 2);

    const duration = await film.evaluate((el: HTMLVideoElement) => el.duration);
    await expect.poll(() => at(film)).toBeCloseTo(duration * 0.6, 0);
  });
});
