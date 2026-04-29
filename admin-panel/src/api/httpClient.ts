import axios from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { ENDPOINTS } from "./endpoints";

export const httpClient: AxiosInstance = axios.create({
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
        try {
          const { data } = await httpClient.post<{ data: { accessToken: string } }>(
            ENDPOINTS.AUTH_REFRESH,
          );
          const newToken = data.data.accessToken;
          deps.setAccessToken(newToken);
          original.headers.Authorization = `Bearer ${newToken}`;
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
