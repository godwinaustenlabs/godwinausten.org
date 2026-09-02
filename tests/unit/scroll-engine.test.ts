import { describe, expect, it } from "vitest";
import {
  clamp,
  holdProgress,
  PIN_MIN_WIDTH,
  pinLead,
  progressThroughViewport,
  resolveMode,
  STRIP_MIN_WIDTH,
  stripGeometry,
} from "@/modules/runtime/scroll-engine";

describe("resolveMode", () => {
  it("runs the filmstrip on wide viewports", () => {
    expect(resolveMode(STRIP_MIN_WIDTH, false)).toBe("strip");
    expect(resolveMode(1920, false)).toBe("strip");
  });

  it("falls back to vertical flow below the threshold", () => {
    expect(resolveMode(STRIP_MIN_WIDTH - 1, false)).toBe("flow");
    expect(resolveMode(390, false)).toBe("flow");
  });

  it("refuses the filmstrip when the visitor asked for reduced motion", () => {
    // Non-negotiable — CLAUDE.md §3.4. Width must not be able to override it.
    expect(resolveMode(1920, true)).toBe("flow");
  });
});

describe("stripGeometry", () => {
  it("makes the document exactly tall enough to travel the whole track", () => {
    const { distance, scrollHeight } = stripGeometry(5000, 1200, 800);
    expect(distance).toBe(3800);
    // The browser's max scrollY is scrollHeight - viewportHeight, and that has
    // to land precisely on `distance` or the end of the page is a dead zone.
    expect(scrollHeight - 800).toBe(distance);
  });

  it("never asks for negative travel when the track fits on screen", () => {
    expect(stripGeometry(900, 1200, 800)).toEqual({ distance: 0, scrollHeight: 800 });
  });
});

describe("progressThroughViewport", () => {
  const viewport = { width: 1000, height: 500 };
  const rect = (top: number, height: number) => ({
    top,
    bottom: top + height,
    left: top,
    right: top + height,
  });

  it("reads 0 the moment before an element enters", () => {
    expect(progressThroughViewport(rect(500, 200), viewport, "y")).toBe(0);
  });

  it("reads 1 the moment after it has left", () => {
    expect(progressThroughViewport(rect(-200, 200), viewport, "y")).toBe(1);
  });

  it("reads 0.5 when it is centred", () => {
    // A 200px block centred in a 500px viewport sits at top = 150.
    expect(progressThroughViewport(rect(150, 200), viewport, "y")).toBeCloseTo(0.5, 5);
  });

  it("measures the horizontal axis the same way", () => {
    // Same geometry, but against the 1000px-wide axis.
    const horizontal = { top: 0, bottom: 0, left: 1000, right: 1200 };
    expect(progressThroughViewport(horizontal, viewport, "x")).toBe(0);
  });

  it("stays clamped for elements far outside the viewport", () => {
    expect(progressThroughViewport(rect(9999, 200), viewport, "y")).toBe(0);
    expect(progressThroughViewport(rect(-9999, 200), viewport, "y")).toBe(1);
  });
});

describe("clamp", () => {
  it("bounds a value to the range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });
});

describe("pinLead", () => {
  // A section twice the height of the viewport, scrolled 300px past the top.
  const rect = { top: -300, left: -300, width: 2400, height: 1600 };

  it("pins on a viewport wide enough for it", () => {
    expect(pinLead(rect, { width: PIN_MIN_WIDTH, height: 800 }, "y")).toBe(300);
    expect(pinLead(rect, { width: 1440, height: 800 }, "x")).toBe(300);
  });

  it("refuses to pin on a phone", () => {
    // The transform is a frame behind native scrolling, which reads as a
    // shudder against the text beside it. Below the breakpoint the section is
    // an ordinary stack and the head scrolls away with its rows.
    expect(pinLead(rect, { width: PIN_MIN_WIDTH - 1, height: 844 }, "y")).toBe(0);
    expect(pinLead(rect, { width: 390, height: 844 }, "y")).toBe(0);
  });

  it("returns a flat 0 rather than the last value, so a resize releases the head", () => {
    // Writing 0 is what un-sticks a head that was already offset when the
    // viewport crossed the breakpoint. Skipping the write would freeze it.
    const wide = pinLead(rect, { width: 1440, height: 800 }, "y");
    const narrow = pinLead(rect, { width: 500, height: 800 }, "y");
    expect(wide).toBeGreaterThan(0);
    expect(narrow).toBe(0);
  });

  it("still clamps to the section, so a head is never carried past its own end", () => {
    // Same guarantee `leadOffset` gives: travel stops at extent - span.
    const shallow = { top: -9999, left: 0, width: 1440, height: 1000 };
    expect(pinLead(shallow, { width: 1440, height: 800 }, "y")).toBe(200);
  });
});

describe("holdProgress", () => {
  const viewport = { width: 1440, height: 900 };
  // A two-screen-wide panel: one screen of content, one of scroll budget.
  const panel = (left: number) => ({ top: 0, left, width: viewport.width * 2, height: 900 });

  it("reads 0 the moment the section's leading edge lands", () => {
    expect(holdProgress(panel(0), viewport, "x")).toBe(0);
  });

  it("reads 1 once it has travelled as far as it can while still covering the screen", () => {
    // Range is `extent - span` = one viewport width.
    expect(holdProgress(panel(-viewport.width), viewport, "x")).toBe(1);
  });

  it("reads 0.5 halfway, which is what puts the second of three offerings in the window", () => {
    expect(holdProgress(panel(-viewport.width / 2), viewport, "x")).toBeCloseTo(0.5, 5);
  });

  it("stays clamped either side of the hold", () => {
    expect(holdProgress(panel(5000), viewport, "x")).toBe(0);
    expect(holdProgress(panel(-9999), viewport, "x")).toBe(1);
  });

  it("is 0 for a section no bigger than the viewport, which has nothing to hold", () => {
    // The reason `services-rows` asks for a 2vw panel: a 1vw one cannot pin,
    // and dividing by its zero range would be a NaN in the style attribute.
    const exact = { top: 0, left: 0, width: viewport.width, height: 900 };
    expect(holdProgress(exact, viewport, "x")).toBe(0);
    expect(Number.isNaN(holdProgress(exact, viewport, "x"))).toBe(false);
  });

  it("refuses to hold on a phone, for the same reason nothing pins there", () => {
    const small = { width: 390, height: 844 };
    expect(holdProgress({ top: -400, left: 0, width: 390, height: 2000 }, small, "y")).toBe(0);
  });

  it("measures the vertical axis the same way", () => {
    const tall = { top: -450, left: 0, width: 1440, height: 1800 };
    expect(holdProgress(tall, viewport, "y")).toBeCloseTo(0.5, 5);
  });
});
