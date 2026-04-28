import { httpClient } from "./httpClient";
import { ENDPOINTS } from "./endpoints";
import { toSession } from "@/facades/AuthFacade";
import type { ApiLoginResponse } from "@/facades/AuthFacade";
import type { Session, LoginCredentials } from "@/features/auth/types";

interface ApiEnvelope<T> {
  readonly success: true;
  readonly data: T;
}

interface TokenPair {
  readonly accessToken: string;
  readonly refreshToken: string;
}

/**
 * Logs in an admin user.
 * Calls AuthFacade.toSession to extract adminUser from the JWT payload.
 */
export async function login(credentials: LoginCredentials): Promise<Session> {
  const { data } = await httpClient.post<ApiLoginResponse>(
    ENDPOINTS.AUTH_LOGIN,
    credentials,
  );
  return toSession(data, credentials.email);
}

/**
 * Silently refreshes the access token using the HttpOnly refresh cookie.
 * Returns the new access token on success.
 */
export async function refreshToken(): Promise<string> {
  const { data } = await httpClient.post<ApiEnvelope<TokenPair>>(ENDPOINTS.AUTH_REFRESH);
  return data.data.accessToken;
}

/**
 * Logs out the current admin session by revoking the refresh token family.
 */
export async function logout(): Promise<void> {
  await httpClient.post(ENDPOINTS.AUTH_LOGOUT);
}
