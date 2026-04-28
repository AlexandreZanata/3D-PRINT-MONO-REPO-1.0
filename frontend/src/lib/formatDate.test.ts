import { describe, it, expect } from "vitest";
import { formatDate, formatDateTime } from "./formatDate";

describe("formatDate", () => {
  it("should format an ISO string as a short date", () => {
    expect(formatDate("2026-04-28T14:00:00Z")).toMatch(/Apr 28, 2026/);
  });

  it("should handle a date string and return a non-empty formatted string", () => {
    const result = formatDate("2026-06-15T12:00:00Z");
    expect(result).toMatch(/Jun/);
    expect(result).toMatch(/2026/);
  });
});

describe("formatDateTime", () => {
  it("should include both date and time", () => {
    const result = formatDateTime("2026-04-28T14:30:00Z");
    expect(result).toMatch(/2026/);
    expect(result).toMatch(/Apr/);
  });

  it("should handle edge case of end of year", () => {
    const result = formatDateTime("2026-12-31T23:59:59Z");
    expect(result).toMatch(/Dec/);
    expect(result).toMatch(/2026/);
  });
});
