import { describe, expect, it } from "vitest";
import { settingsFormToRecord } from "./settingsFormToRecord";

describe("settingsFormToRecord", () => {
  it("copies string entries (happy path)", () => {
    expect(
      settingsFormToRecord({
        "hero.headline": "Hello",
        "hero.ctaLabel": "Shop",
      }),
    ).toEqual({
      "hero.headline": "Hello",
      "hero.ctaLabel": "Shop",
    });
  });

  it("skips non-string values (edge)", () => {
    const mixed = { a: "ok", b: 1, c: null };
    expect(settingsFormToRecord(mixed)).toEqual({ a: "ok" });
  });

  it("returns empty object for empty input", () => {
    expect(settingsFormToRecord({})).toEqual({});
  });
});
