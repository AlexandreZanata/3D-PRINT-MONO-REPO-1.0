import { useEffect, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "@/features/cart/CartProvider";
import { initHttpClient } from "@/api/httpClient";
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

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Root provider tree — wraps the entire app.
 *
 * NOTE: Silent token refresh is NOT done here on startup.
 * Reason: it causes ECONNREFUSED proxy errors when the backend is not running,
 * and it's unnecessary for public pages (catalog, shop, product detail).
 * The admin routes handle their own auth check via beforeLoad guards.
 * If you need session restoration, call refreshToken() inside the admin layout route.
 */
export function AppProviders({ children }: AppProvidersProps) {
  useHttpClientInit();

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>{children}</CartProvider>
    </QueryClientProvider>
  );
}
