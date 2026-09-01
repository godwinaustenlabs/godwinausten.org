import { describe, expect, it } from "vitest";
import { block, composePage, insertAfter, only, patch, reorder, without } from "@/modules";

const base = () =>
  composePage("home", [
    block("hero", "hero-vsl", { headline: "A" }),
    block("proof", "proof-logos", {}),
    block("cta", "cta-band", {}),
  ]);

describe("composePage", () => {
  it("rejects duplicate keys", () => {
    expect(() => composePage("bad", [block("a", "x", {}), block("a", "y", {})])).toThrow(
      /Duplicate block key "a"/,
    );
  });
});

describe("composition transforms", () => {
  it("removes blocks by key", () => {
    expect(without(base(), "proof").blocks.map((b) => b.key)).toEqual(["hero", "cta"]);
  });

  it("keeps only the listed keys, in the given order", () => {
    expect(only(base(), "cta", "hero").blocks.map((b) => b.key)).toEqual(["cta", "hero"]);
  });

  it("ignores unknown keys in only()", () => {
    expect(only(base(), "hero", "nope").blocks.map((b) => b.key)).toEqual(["hero"]);
  });

  it("moves listed keys to the front and keeps the rest stable", () => {
    expect(reorder(base(), ["cta"]).blocks.map((b) => b.key)).toEqual(["cta", "hero", "proof"]);
  });

  it("inserts after an anchor", () => {
    const next = insertAfter(base(), "hero", block("video", "vsl-player", {}));
    expect(next.blocks.map((b) => b.key)).toEqual(["hero", "video", "proof", "cta"]);
  });

  it("appends when the anchor is missing", () => {
    const next = insertAfter(base(), "ghost", block("video", "vsl-player", {}));
    expect(next.blocks.at(-1)?.key).toBe("video");
  });

  it("patches one instance without touching the others", () => {
    const next = patch(base(), "hero", { visibility: { base: false, md: true } });
    expect(next.blocks[0]?.visibility).toEqual({ base: false, md: true });
    expect(next.blocks[1]?.visibility).toBeUndefined();
  });

  it("does not mutate the input composition", () => {
    const original = base();
    without(original, "hero");
    expect(original.blocks).toHaveLength(3);
  });
});
