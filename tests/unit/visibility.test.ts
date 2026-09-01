import { describe, expect, it } from "vitest";
import { visibilityClasses } from "@/modules";

describe("visibilityClasses", () => {
  it("returns nothing when visibility is unset", () => {
    expect(visibilityClasses(undefined)).toBe("");
  });

  it("hides at base and shows from md up", () => {
    expect(visibilityClasses({ base: false, md: true })).toBe("hidden md:block");
  });

  it("collapses runs of the same value", () => {
    expect(visibilityClasses({ base: true, sm: true, md: true })).toBe("block");
  });

  it("emits a class at every breakpoint the value flips", () => {
    expect(visibilityClasses({ base: true, md: false, xl: true })).toBe("block md:hidden xl:block");
  });

  it("honours a custom display mode", () => {
    expect(visibilityClasses({ base: false, lg: true }, "flex")).toBe("hidden lg:flex");
  });
});
