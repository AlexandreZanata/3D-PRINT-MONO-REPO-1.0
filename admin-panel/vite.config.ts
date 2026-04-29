import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const API_BASE_URL = process.env["VITE_API_BASE_URL"] ?? "http://localhost:3000";

export default defineConfig({
  vite: {
    server: {
      port: 8082,
      proxy: {
        "/api": {
          target: API_BASE_URL,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      outDir: "dist",
      sourcemap: "hidden",
    },
  },
});
