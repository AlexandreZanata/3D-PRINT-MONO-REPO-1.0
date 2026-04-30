import axios from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import type { ApiSuccessTokenPair } from "./authTypes";
import { ENDPOINTS } from "./endpoints";
import { resolveApiBaseUrl } from "./resolveApiBaseUrl";

export const httpClient: AxiosInstance = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export interface HttpClientDeps {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  getCsrfToken: () => string | null;
  setTokenPair: (accessToken: string, refreshToken: string) => void;
  clearSession: () => void;
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export function initHttpClient(deps: HttpClientDeps): void {
  httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = deps.getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;

    const csrfToken = deps.getCsrfToken();
    const isAdminMutation =
      csrfToken !== null &&
      config.url?.startsWith("/api/v1/admin") === true &&
      ["post", "put", "patch", "delete"].includes((config.method ?? "").toLowerCase());
    if (isAdminMutation) config.headers["X-CSRF-Token"] = csrfToken;

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    config.headers["X-Correlation-ID"] = crypto.randomUUID();
    return config;
  });

  httpClient.interceptors.response.use(
    (res) => res,
    async (error: unknown) => {
      if (!axios.isAxiosError(error)) return Promise.reject(error);

      // Axios types omit _retry; we annotate for the retry loop only.
      const original = error.config as RetriableConfig | undefined;
      if (!original) return Promise.reject(error);

      if (error.response?.status === 401 && !original._retry) {
        original._retry = true;
        const refresh = deps.getRefreshToken();
        if (refresh === null || refresh.length === 0) {
          deps.clearSession();
          window.location.href = "/login";
          return Promise.reject(error);
        }
        try {
          const { data } = await httpClient.post<ApiSuccessTokenPair>(ENDPOINTS.AUTH_REFRESH, {
            refreshToken: refresh,
          });
          deps.setTokenPair(data.data.accessToken, data.data.refreshToken);
          original.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return httpClient(original);
        } catch {
          deps.clearSession();
          window.location.href = "/login";
          return Promise.reject(error);
        }
      }
      return Promise.reject(error);
    },
  );
}
