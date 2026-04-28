import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

/**
 * Standalone Vitest config — bypasses the TanStack Start vite config
 * which is incompatible with the Vitest server environment.
 * Only runs unit tests for pure lib/ utilities and hooks.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/lib/**/*.test.ts"],
    globals: false,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
