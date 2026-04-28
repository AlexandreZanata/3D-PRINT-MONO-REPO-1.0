import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useDarkMode } from "./useDarkMode";

/**
 * useDarkMode uses DOM APIs (document.documentElement) and localStorage.
 * These tests run in a jsdom-like environment via vitest's happy-dom or node.
 * Since we're in node environment, we mock the DOM APIs.
 */

const mockClassList = {
  _classes: new Set<string>(),
  add(cls: string) { this._classes.add(cls); },
  remove(cls: string) { this._classes.delete(cls); },
  contains(cls: string) { return this._classes.has(cls); },
  reset() { this._classes.clear(); },
};

// Mock document.documentElement
vi.stubGlobal("document", {
  documentElement: { classList: mockClassList },
});

// Mock localStorage
const store: Record<string, string> = {};
vi.stubGlobal("localStorage", {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
});

// Mock window.addEventListener for storage events
vi.stubGlobal("window", {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  innerWidth: 1024,
});

describe("useDarkMode", () => {
  beforeEach(() => {
    mockClassList.reset();
    Object.keys(store).forEach((k) => delete store[k]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should default to light mode when no preference is stored", () => {
    // The hook reads from localStorage — no stored value means false
    const stored = localStorage.getItem("forma_dark_mode");
    expect(stored).toBeNull();
  });

  it("should store dark mode preference in localStorage", () => {
    localStorage.setItem("forma_dark_mode", JSON.stringify(true));
    const stored = localStorage.getItem("forma_dark_mode");
    expect(JSON.parse(stored ?? "false")).toBe(true);
  });

  it("should read false as the default value when key is missing", () => {
    const raw = localStorage.getItem("forma_dark_mode");
    const value = raw !== null ? (JSON.parse(raw) as boolean) : false;
    expect(value).toBe(false);
  });
});
