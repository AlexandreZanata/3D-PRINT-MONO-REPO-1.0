import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

/**
 * Vitest config — two environments:
 * - node: pure lib, facade, and hook unit tests (no DOM needed)
 * - happy-dom: component tests (atoms, molecules, organisms, pages)
 *
 * Bypasses the TanStack Start vite config which is incompatible with Vitest.
 */
export default defineConfig({
  test: {
    // Default environment for component tests
    environment: "happy-dom",
    setupFiles: ["./src/test/setup.ts"],
    include: [
      "src/lib/**/*.test.ts",
      "src/facades/**/*.test.ts",
      "src/hooks/**/*.test.ts",
      "src/atoms/**/*.test.tsx",
      "src/molecules/**/*.test.tsx",
      "src/organisms/**/*.test.tsx",
    ],
    globals: true,
    // Override environment per file pattern
    environmentMatchGlobs: [
      // Pure unit tests run in node (faster, no DOM overhead)
      ["src/lib/**/*.test.ts", "node"],
      ["src/facades/**/*.test.ts", "node"],
    ],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@repo/contracts": resolve(__dirname, "../backend/packages/contracts/dist/index.js"),
    },
  },
});
