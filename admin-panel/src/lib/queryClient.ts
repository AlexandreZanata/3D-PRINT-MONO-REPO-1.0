import { QueryClient } from "@tanstack/react-query";

/**
 * Singleton QueryClient for the admin app. Lives outside `AppProviders.tsx` so
 * React Fast Refresh does not treat non-component exports as incompatible.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});
