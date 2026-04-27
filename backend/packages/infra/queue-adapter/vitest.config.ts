// @max-lines 200 — this is enforced by the lint pipeline.
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      thresholds: { lines: 80 },
    },
  },
});
