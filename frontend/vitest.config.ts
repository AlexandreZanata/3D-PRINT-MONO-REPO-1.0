import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

/**
 * Standalone Vitest config — bypasses the TanStack Start vite config
 * which is incompatible with the Vitest server environment.
 * Mirrors the path aliases defined in tsconfig.json.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/lib/**/*.test.ts", "src/facades/**/*.test.ts", "src/hooks/**/*.test.ts"],
    globals: false,
  },
  resolve: {
    alias: {
      // "@/" alias — matches tsconfig.json paths
      "@": resolve(__dirname, "./src"),
      // @repo/contracts — points to built dist types
      "@repo/contracts": resolve(__dirname, "../backend/packages/contracts/dist/index.js"),
    },
  },
});
