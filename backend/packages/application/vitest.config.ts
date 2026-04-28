// @max-lines 200 — this is enforced by the lint pipeline.
import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@repo/utils": resolve(__dirname, "../utils/src/index.ts"),
      "@repo/domain": resolve(__dirname, "../domain/src/index.ts"),
      "@repo/contracts": resolve(__dirname, "../contracts/src/index.ts"),
    },
  },
  test: {
    globals: true,
    environment: "node",
    passWithNoTests: true,
    coverage: {
      provider: "v8",
      thresholds: { lines: 80 },
    },
  },
});
