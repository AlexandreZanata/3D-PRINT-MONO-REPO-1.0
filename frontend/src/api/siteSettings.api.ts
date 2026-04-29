import { httpClient } from "./httpClient";
import { ENDPOINTS } from "./endpoints";
import { toSiteSettings } from "@/facades/ProductFacade";
import type { SiteSettings } from "@/features/products/types";

interface ApiEnvelope<T> {
  readonly success: true;
  readonly data: T;
}

/** Fetches all site settings (public, no auth required). */
export async function fetchSiteSettings(): Promise<SiteSettings> {
  const { data } = await httpClient.get<ApiEnvelope<Record<string, string>>>(
    ENDPOINTS.SITE_SETTINGS,
  );
  return toSiteSettings(data.data);
}

/** Updates site settings (admin only). */
export async function adminUpdateSiteSettings(
  settings: Record<string, string>,
): Promise<SiteSettings> {
  const { data } = await httpClient.put<ApiEnvelope<Record<string, string>>>(
    ENDPOINTS.ADMIN_SITE_SETTINGS,
    { settings },
  );
  return toSiteSettings(data.data);
}
