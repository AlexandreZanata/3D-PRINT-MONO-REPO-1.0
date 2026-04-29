import { useQuery } from "@tanstack/react-query";
import { fetchSiteSettings } from "@/api/siteSettings.api";
import type { SiteSettings } from "../types";

export const SITE_SETTINGS_QUERY_KEY = ["site-settings"] as const;

/**
 * Fetches all site settings.
 * Stale time: 60 seconds — settings change rarely and are admin-controlled.
 */
export function useSiteSettings(): {
  data: SiteSettings | undefined;
  isLoading: boolean;
} {
  const { data, isLoading } = useQuery({
    queryKey: SITE_SETTINGS_QUERY_KEY,
    queryFn: fetchSiteSettings,
    staleTime: 60 * 1000,
  });
  return { data, isLoading };
}

/** Helper: read a single setting with a fallback default. */
export function useSetting(settings: SiteSettings | undefined, key: string, fallback: string): string {
  return settings?.[key] ?? fallback;
}
