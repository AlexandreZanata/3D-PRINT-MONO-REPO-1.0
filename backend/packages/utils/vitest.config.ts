import { resolve } from "node:path";
// @max-lines 200 — this is enforced by the lint pipeline.
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@repo/utils": resolve(__dirname, "src/index.ts"),
    },
    // Allow vitest to resolve .js imports to .ts sources
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
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
