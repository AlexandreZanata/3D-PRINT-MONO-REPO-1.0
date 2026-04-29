import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminUpdateSiteSettings, fetchSiteSettings } from "@/api/siteSettings.api";
import { SITE_SETTINGS_QUERY_KEY } from "@/features/products/hooks/useSiteSettings";
import type { SiteSettings } from "@/features/products/types";

/** Fetches site settings for the admin panel (same endpoint, no auth needed for GET). */
export function useAdminSiteSettings(): {
  data: SiteSettings | undefined;
  isLoading: boolean;
} {
  const { data, isLoading } = useQuery({
    queryKey: SITE_SETTINGS_QUERY_KEY,
    queryFn: fetchSiteSettings,
    staleTime: 0,
  });
  return { data, isLoading };
}

/** Saves site settings and invalidates the cache. */
export function useUpdateSiteSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: Record<string, string>) => adminUpdateSiteSettings(settings),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SITE_SETTINGS_QUERY_KEY });
    },
  });
}
