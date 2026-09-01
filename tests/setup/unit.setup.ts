import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
});

// jsdom has no IntersectionObserver / matchMedia, and Motion needs both.
// Without these, any component using `whileInView` or `useReducedMotion`
// throws before the assertion runs.
vi.stubGlobal(
  "IntersectionObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  },
);

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }),
});

// jsdom has no media pipeline, so `play()`/`pause()` throw "Not implemented"
// noise into every run that touches a video tile. Stub them to no-ops: what the
// tests assert is that the element is configured correctly, not that jsdom can
// decode video.
Object.defineProperty(HTMLMediaElement.prototype, "play", {
  writable: true,
  value: () => Promise.resolve(),
});
Object.defineProperty(HTMLMediaElement.prototype, "pause", {
  writable: true,
  value: () => {},
});

// jsdom has no canvas backend, so the scroll-morph lattice logs "getContext not
// implemented" into every run that renders it. The component already handles a
// null context by doing nothing; this keeps the noise out of the output.
HTMLCanvasElement.prototype.getContext = () => null;
