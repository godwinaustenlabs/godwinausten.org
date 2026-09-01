import { describe, expect, it } from "vitest";
import {
  clamp,
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
