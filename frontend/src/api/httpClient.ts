import axios from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { ENDPOINTS } from "./endpoints";

/**
 * Axios instance — the single HTTP client for the entire frontend.
 *
 * Interceptors are added lazily via initHttpClient() called once in main.tsx.
 * This avoids circular imports between httpClient ↔ authStore.
 *
 * Security properties:
 * - withCredentials: true  → HttpOnly refresh-token cookie is sent automatically
 * - X-Correlation-ID       → UUIDv4 per request for distributed tracing
 * - Authorization header   → Bearer <accessToken> from authStore (memory only)
 * - Never logs token values
 */
export const httpClient: AxiosInstance = axios.create({
  // Empty baseURL means requests use the same origin — Vite dev proxy forwards /api/* to the backend.
  // In production, nginx handles the proxy (see nginx.conf).
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export interface HttpClientDeps {
  getAccessToken: () => string | null;
  getCsrfToken: () => string | null;
  setAccessToken: (token: string) => void;
  clearSession: () => void;
}

/**
 * Wires auth store into the Axios interceptors.
 * Must be called once at app startup (main.tsx) after the store is ready.
 */
export function initHttpClient(deps: HttpClientDeps): void {
  // ── Request interceptor ────────────────────────────────────────────────────
  httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = deps.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Attach CSRF token for admin mutations
    const csrfToken = deps.getCsrfToken();
    const isAdminMutation =
      csrfToken !== null &&
      config.url?.startsWith("/api/v1/admin") === true &&
      ["post", "put", "patch", "delete"].includes((config.method ?? "").toLowerCase());

    if (isAdminMutation) {
      config.headers["X-CSRF-Token"] = csrfToken;
    }

    config.headers["X-Correlation-ID"] = crypto.randomUUID();
    return config;
  });

  // ── Response interceptor ───────────────────────────────────────────────────
  httpClient.interceptors.response.use(
    (res) => res,
    async (error: unknown) => {
      if (!axios.isAxiosError(error)) return Promise.reject(error);

      const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
      if (!original) return Promise.reject(error);

      if (error.response?.status === 401 && !original._retry) {
        original._retry = true;
        try {
          // Silent refresh — uses the HttpOnly cookie automatically
          const { data } = await httpClient.post<{ data: { accessToken: string } }>(
            ENDPOINTS.AUTH_REFRESH,
          );
          const newToken = data.data.accessToken;
          deps.setAccessToken(newToken);
          original.headers.Authorization = `Bearer ${newToken}`;
          return httpClient(original);
        } catch {
          deps.clearSession();
          // Redirect to home — /login route will be added in a later section
          window.location.href = "/";
          return Promise.reject(error);
        }
      }

      return Promise.reject(error);
    },
  );
}
