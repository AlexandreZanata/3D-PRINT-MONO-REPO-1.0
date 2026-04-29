import { useEffect, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { initHttpClient } from "@/api/httpClient";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/store/authStore";

function useHttpClientInit(): void {
  const { getState } = useAuthStore;
  useEffect(() => {
    initHttpClient({
      getAccessToken: () => getState().accessToken,
      getRefreshToken: () => getState().refreshToken,
      getCsrfToken: () => getState().csrfToken,
      setTokenPair: (accessToken, refreshToken) => getState().setTokenPair(accessToken, refreshToken),
      clearSession: () => getState().clearSession(),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function AppProviders({ children }: { children: ReactNode }) {
  useHttpClientInit();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
