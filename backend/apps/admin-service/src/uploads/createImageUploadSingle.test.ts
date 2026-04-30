import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createImageUploadSingle } from "./createImageUploadSingle.js";

describe("createImageUploadSingle", () => {
  it("returns an Express middleware function", () => {
    const dir = path.join(tmpdir(), `upload-mw-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    try {
      const mw = createImageUploadSingle(dir);
      expect(typeof mw).toBe("function");
      expect(mw.length).toBe(3);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
