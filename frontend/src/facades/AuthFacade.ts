import type { Session } from "@/features/auth/types";

/**
 * Raw API shapes for the auth feature.
 */
export interface ApiTokenPair {
  readonly accessToken: string;
  readonly refreshToken: string;
}

export interface ApiLoginResponse {
  readonly success: true;
  readonly data: ApiTokenPair;
}

/**
 * JWT payload structure (decoded from the access token).
 * Not verified client-side — signature verification happens on the server.
 */
interface JwtPayload {
  readonly sub: string;
  readonly role: string;
  readonly iat: number;
  readonly exp: number;
}

/**
 * Decodes the JWT payload (base64url) without verifying the signature.
 * Throws if the token format is invalid.
 */
function decodeJwtPayload(token: string): JwtPayload {
  const parts = token.split(".");
  const payloadPart = parts[1];
  if (!payloadPart) throw new Error("Invalid JWT: missing payload segment");
  // atob is safe here — we only decode, never trust without server verification
  return JSON.parse(atob(payloadPart)) as JwtPayload;
}

/**
 * Maps a raw login API response to a frontend Session.
 * Extracts adminUser fields from the JWT payload.
 */
export function toSession(raw: ApiLoginResponse, email: string): Session {
  const payload = decodeJwtPayload(raw.data.accessToken);
  return {
    accessToken: raw.data.accessToken,
    adminUser: {
      id: payload.sub,
      email,
      role: payload.role,
    },
  };
}
