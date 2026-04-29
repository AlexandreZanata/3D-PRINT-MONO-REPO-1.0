import { httpClient } from "./httpClient";
import { ENDPOINTS } from "./endpoints";
import type { ApiSuccessTokenPair } from "./authTypes";
import { toSession } from "@/facades/AuthFacade";
import type { ApiLoginResponse } from "@/facades/AuthFacade";
import type { Session, LoginCredentials } from "@/features/auth/types";

export async function login(credentials: LoginCredentials): Promise<Session> {
  const { data } = await httpClient.post<ApiLoginResponse>(ENDPOINTS.AUTH_LOGIN, credentials);
  return toSession(data, credentials.email);
}

export async function refreshWithToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
  const { data } = await httpClient.post<ApiSuccessTokenPair>(ENDPOINTS.AUTH_REFRESH, {
    refreshToken,
  });
  return data.data;
}

export async function logout(refreshToken: string): Promise<void> {
  await httpClient.post(ENDPOINTS.AUTH_LOGOUT, { refreshToken });
}
