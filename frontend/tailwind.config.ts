/**
 * Tailwind CSS configuration — reference file for tooling and IDE support.
 *
 * NOTE: This project uses Tailwind CSS v4 via @tailwindcss/vite, which uses
 * CSS-first configuration (see src/styles/globals.css @theme block).
 * This file documents the token mapping for IDE autocomplete and is NOT
 * processed by the Tailwind v4 build pipeline.
 *
 * Design tokens are defined in src/styles/tokens.css as CSS custom properties
 * and referenced in globals.css via @theme inline.
 */
import type { Config } from "tailwindcss";

const config: Config = {
  // Dark mode: class-based — root <html> gets class="dark" via useDarkMode hook
  darkMode: "class",

  // Content paths — all source files that contain Tailwind classes
  content: [
    "./src/**/*.{ts,tsx}",
    "./src/atoms/**/*.{ts,tsx}",
    "./src/molecules/**/*.{ts,tsx}",
    "./src/organisms/**/*.{ts,tsx}",
    "./src/templates/**/*.{ts,tsx}",
    "./src/pages/**/*.{ts,tsx}",
    "./src/routes/**/*.{ts,tsx}",
  ],

  theme: {
    extend: {
      // Token mapping — mirrors src/styles/tokens.css CSS custom properties
      colors: {
        primary: "var(--color-primary)",
        "primary-hover": "var(--color-primary-hover)",
        danger: "var(--color-danger)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        "bg-page": "var(--color-bg-page)",
        "bg-surface": "var(--color-bg-surface)",
        "text-primary": "var(--color-text-primary)",
        "text-muted": "var(--color-text-muted)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
      },
    },
  },

  plugins: [],
};

export default config;
