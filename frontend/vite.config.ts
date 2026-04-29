/**
 * Vite configuration for the Forma frontend.
 *
 * Uses @lovable.dev/vite-tanstack-config which already includes:
 * tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
 * componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack
 * dedupe, error logger plugins, and sandbox detection.
 *
 * Additional config is passed via the `vite` key.
 */
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const API_BASE_URL = process.env["VITE_API_BASE_URL"] || "http://localhost:3000";

export default defineConfig({
  vite: {
    server: {
      /**
       * Dev proxy — forwards /api/* to the backend api-gateway.
       * Avoids CORS issues during local development.
       * In production, nginx handles this (see infra/nginx.conf).
       */
      proxy: {
        "/api": {
          target: API_BASE_URL,
          changeOrigin: true,
          secure: false,
        },
      },
    },

    build: {
      /**
       * Output compiled assets to dist/.
       * Source maps are external files (not inlined) for production debugging
       * without exposing source to end users.
       */
      outDir: "dist",
      sourcemap: "hidden",
      /** Single CSS entry in HTML avoids staggered chunk paints (FOUC). */
      cssCodeSplit: false,
    },
  },
});
