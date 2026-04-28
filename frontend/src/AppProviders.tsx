import { useEffect, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "@/features/cart/CartProvider";
import { initHttpClient } from "@/api/httpClient";
import { refreshToken } from "@/api/auth.api";
import { useAuthStore } from "@/store/authStore";

/**
 * Singleton QueryClient — shared across the entire app.
 * Stale times are set per-query in each feature hook.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Wires the httpClient interceptors to the authStore.
 * Called once when AppProviders mounts.
 */
function useHttpClientInit(): void {
  const { getState } = useAuthStore;

  useEffect(() => {
    initHttpClient({
      getAccessToken: () => getState().accessToken,
      getCsrfToken: () => getState().csrfToken,
      setAccessToken: (token) => getState().setAccessToken(token),
      clearSession: () => getState().clearSession(),
    });
  // Run once on mount — getState is stable
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/**
 * Attempts a silent token refresh on app startup.
 * Restores the session from the HttpOnly refresh-token cookie if present.
 * Silently fails if no cookie exists — user stays unauthenticated.
 */
function useSilentRefresh(): void {
  const setAccessToken = useAuthStore((s) => s.setAccessToken);

  useEffect(() => {
    refreshToken()
      .then((token) => setAccessToken(token))
      .catch(() => {
        // No valid cookie — user is not authenticated, nothing to do
      });
  // Run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Root provider tree — wraps the entire app.
 * Order matters: QueryClientProvider must wrap everything that uses React Query.
 */
export function AppProviders({ children }: AppProvidersProps) {
  useHttpClientInit();
  useSilentRefresh();

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>{children}</CartProvider>
    </QueryClientProvider>
  );
}
