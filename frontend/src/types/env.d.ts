/// <reference types="vite/client" />

/**
 * Type declarations for import.meta.env variables.
 * All VITE_* variables must be declared here to get TypeScript support.
 */
interface ImportMetaEnv {
  /** Backend api-gateway base URL. Example: http://localhost:3000 */
  readonly VITE_API_BASE_URL: string;
  /** Full SSE endpoint URL. Example: http://localhost:3000/api/v1/products/events */
  readonly VITE_SSE_URL: string;
  /** App version injected from package.json at build time */
  readonly VITE_APP_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
