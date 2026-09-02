import { describe, expect, it } from "vitest";
import { MEDIA_ASSETS, isMediaId, mediaHref, parseRange } from "@/server/media";

describe("the media allowlist", () => {
  it("accepts only the ids it declares", () => {
    for (const id of Object.keys(MEDIA_ASSETS)) expect(isMediaId(id)).toBe(true);
  });

  it("rejects anything else, including attempts to reach past it", () => {
    // The whole point of addressing assets by id: there is no user-supplied
    // string that becomes a bucket key, so there is no traversal to defend.
    for (const attempt of [
      "../secret",
      "playbook/../../etc/passwd",
      "vsl/main.mp4",
      "",
      "constructor",
      "__proto__",
      "toString",
    ]) {
      expect(isMediaId(attempt)).toBe(false);
    }
  });

  it("builds URLs that carry the id and never the key", () => {
    expect(mediaHref("vsl")).toBe("/api/media/vsl");
    expect(mediaHref("playbook", { download: true })).toBe("/api/media/playbook?download=1");
    expect(mediaHref("playbook")).not.toContain(MEDIA_ASSETS.playbook.key);
  });

  it("gives the download-only asset a filename and the streamed ones none", () => {
    // `Content-Disposition` is what makes the guide save instead of opening in
    // a tab; a film must never get one or it downloads instead of playing.
    expect(MEDIA_ASSETS.playbook.filename).toBeTruthy();
    expect(MEDIA_ASSETS.vsl.filename).toBeNull();
  });

  it("only stands in for an asset that has somewhere to stand in from", () => {
    // The guide ships a placeholder so the funnel works today. The film cannot:
    // there is no encoder here and a stock clip would be someone else's
    // footage (docs/adr/0003), so its absence is honest rather than papered over.
    expect(MEDIA_ASSETS.playbook.fallback).toBeTruthy();
    expect(MEDIA_ASSETS.vsl.fallback).toBeNull();
  });
});

describe("parseRange", () => {
  const SIZE = 1000;

  it("returns null when the player wants the whole file", () => {
    expect(parseRange(null, SIZE)).toBeNull();
    expect(parseRange("", SIZE)).toBeNull();
  });

  it("reads a closed range", () => {
    expect(parseRange("bytes=0-99", SIZE)).toEqual({ start: 0, end: 99, length: 100 });
    expect(parseRange("bytes=500-599", SIZE)).toEqual({ start: 500, end: 599, length: 100 });
  });

  it("reads an open-ended range as everything that is left", () => {
    expect(parseRange("bytes=900-", SIZE)).toEqual({ start: 900, end: 999, length: 100 });
  });

  it("reads a suffix range, which is how a player finds an MP4's moov atom", () => {
    expect(parseRange("bytes=-200", SIZE)).toEqual({ start: 800, end: 999, length: 200 });
  });

  it("clamps an end past the last byte rather than over-reading", () => {
    expect(parseRange("bytes=990-5000", SIZE)).toEqual({ start: 990, end: 999, length: 10 });
  });

  it("asks for the whole file when a suffix is longer than the file", () => {
    expect(parseRange("bytes=-5000", SIZE)).toEqual({ start: 0, end: 999, length: 1000 });
  });

  it("reports a range it cannot satisfy instead of quietly sending byte 0", () => {
    // A 416 tells the player it asked for something impossible. Handing back
    // the start of the file instead is how a scrubber ends up replaying the
    // opening every time it seeks near the end.
    expect(parseRange("bytes=1000-1100", SIZE)).toBe("unsatisfiable");
    expect(parseRange("bytes=5000-", SIZE)).toBe("unsatisfiable");
    expect(parseRange("bytes=-0", SIZE)).toBe("unsatisfiable");
    expect(parseRange("bytes=600-500", SIZE)).toBe("unsatisfiable");
  });

  it("ignores a multi-range request rather than pretending to honour it", () => {
    // Serving one part of a multipart request as if it were the whole answer
    // is worse than serving the file: the player would render garbage.
    expect(parseRange("bytes=0-99,200-299", SIZE)).toBeNull();
    expect(parseRange("items=0-99", SIZE)).toBeNull();
  });
});
