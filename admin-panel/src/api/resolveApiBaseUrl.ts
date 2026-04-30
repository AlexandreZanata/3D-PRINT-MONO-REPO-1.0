/**
 * Resolves the Axios base URL for the admin SPA.
 *
 * In development, keep same-origin so Vite proxy forwards `/api/*` to backend
 * and avoids browser CORS preflight issues.
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
