import axios from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { ENDPOINTS } from "./endpoints";

/**
 * Axios instance with:
 * - baseURL from VITE_API_BASE_URL
 * - credentials: "include" so HttpOnly refresh-token cookie is sent automatically
 * - X-Correlation-ID header per request
 * - Request interceptor: attaches Bearer access token from authStore
 * - Response interceptor: on 401 → silent refresh → retry once → logout on failure
 */

let _accessToken: string | null = null;
let _onLogout: (() => void) | null = null;

/** Called once at app startup to wire up the token getter and logout callback. */
export function configureHttpClient(opts: {
  getAccessToken: () => string | null;
  onLogout: () => void;
}): void {
  _accessToken = null; // reset
  // Store references — closures keep them live
  httpClient.interceptors.request.clear();
  httpClient.interceptors.response.clear();
  _onLogout = opts.onLogout;

  httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = opts.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers["X-Correlation-ID"] = crypto.randomUUID();
    return config;
  });

  httpClient.interceptors.response.use(
    (res) => res,
    async (error) => {
      const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
      if (error.response?.status === 401 && !original._retry) {
        original._retry = true;
        try {
          const { data } = await httpClient.post<{ data: { accessToken: string } }>(
            ENDPOINTS.AUTH_REFRESH,
          );
          const newToken = data.data.accessToken;
          original.headers.Authorization = `Bearer ${newToken}`;
          // Notify store — caller must update authStore externally
          httpClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          return httpClient(original);
        } catch {
          opts.onLogout();
          return Promise.reject(error);
        }
      }
      return Promise.reject(error);
    },
  );
}

export const httpClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});
