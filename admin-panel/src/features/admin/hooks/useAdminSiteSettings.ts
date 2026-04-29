import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetchSiteSettings, adminUpdateSiteSettings } from "@/api/siteSettings.api";

export function useAdminSiteSettings() {
  return useQuery({
    queryKey: ["admin", "site-settings"] as const,
    queryFn: adminFetchSiteSettings,
    staleTime: 0,
  });
}

export function useUpdateSiteSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: Record<string, string>) => adminUpdateSiteSettings(settings),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "site-settings"] });
    },
  });
}
