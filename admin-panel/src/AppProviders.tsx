import { useEffect, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initHttpClient } from "@/api/httpClient";
import { useAuthStore } from "@/store/authStore";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function useHttpClientInit(): void {
  const { getState } = useAuthStore;
  useEffect(() => {
    initHttpClient({
      getAccessToken: () => getState().accessToken,
      getCsrfToken: () => getState().csrfToken,
      setAccessToken: (token) => getState().setAccessToken(token),
      clearSession: () => getState().clearSession(),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function AppProviders({ children }: { children: ReactNode }) {
  useHttpClientInit();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
