import { httpClient } from "./httpClient";
import { ENDPOINTS } from "./endpoints";
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
 * Logs in an admin user. Returns a Session with accessToken and adminUser.
 * The refreshToken is set as an HttpOnly cookie by the backend automatically.
 */
export async function login(credentials: LoginCredentials): Promise<Session> {
  const { data } = await httpClient.post<ApiEnvelope<TokenPair>>(
    ENDPOINTS.AUTH_LOGIN,
    credentials,
  );
  // Decode the JWT payload to extract adminUser fields
  // The payload is base64url-encoded — no signature verification needed client-side
  const parts = data.data.accessToken.split(".");
  const payloadPart = parts[1];
  if (!payloadPart) throw new Error("Invalid access token format");
  const payload = JSON.parse(atob(payloadPart)) as { sub: string; role: string };

  return {
    accessToken: data.data.accessToken,
    adminUser: { id: payload.sub, email: credentials.email, role: payload.role },
  };
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
