/**
 * Resolves the Axios base URL for the admin SPA.
 *
 * In development, always use same-origin (empty string) so requests hit the Vite
 * dev server and the proxy forwards `/api/*` to the gateway. If `VITE_API_BASE_URL`
 * pointed at `http://localhost:3000`, the browser would call the API directly and
 * trigger CORS preflight unless the backend allows origin `http://localhost:8082`.
 */
export function resolveApiBaseUrlFromEnv(env: {
  readonly DEV: boolean;
  readonly VITE_API_BASE_URL?: string;
}): string {
  if (env.DEV) {
    return "";
  }
  const fromEnv = env.VITE_API_BASE_URL;
  if (typeof fromEnv === "string" && fromEnv.length > 0) {
    return fromEnv;
  }
  return "";
}

export function resolveApiBaseUrl(): string {
  return resolveApiBaseUrlFromEnv(import.meta.env);
}
