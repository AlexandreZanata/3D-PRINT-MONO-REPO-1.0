import { httpClient } from "./httpClient";
import { ENDPOINTS } from "./endpoints";

interface ApiEnvelope<T> {
  readonly success: true;
  readonly data: T;
}

export type SiteSettings = Record<string, string>;

export async function adminFetchSiteSettings(): Promise<SiteSettings> {
  const { data } = await httpClient.get<ApiEnvelope<SiteSettings>>(ENDPOINTS.ADMIN_SITE_SETTINGS);
  return data.data;
}

export async function adminUpdateSiteSettings(settings: Record<string, string>): Promise<SiteSettings> {
  const { data } = await httpClient.put<ApiEnvelope<SiteSettings>>(ENDPOINTS.ADMIN_SITE_SETTINGS, {
    settings,
  });
  return data.data;
}
