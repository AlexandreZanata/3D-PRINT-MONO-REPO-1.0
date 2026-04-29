import type { Session } from "@/features/auth/types";

export interface ApiTokenPair {
  readonly accessToken: string;
  readonly refreshToken: string;
}

export interface ApiLoginResponse {
  readonly success: true;
  readonly data: ApiTokenPair;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Minimal JWT claims required for admin session (signature verified server-side). */
function isJwtPayload(value: unknown): value is { readonly sub: string; readonly role: string } {
  if (!isRecord(value)) return false;
  return typeof value.sub === "string" && typeof value.role === "string";
}

function base64UrlToBinary(segment: string): string {
  const padded = segment.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((segment.length + 3) % 4);
  return padded;
}

function decodeJwtPayload(token: string): { readonly sub: string; readonly role: string } {
  const parts = token.split(".");
  const payloadPart = parts[1];
  if (!payloadPart) throw new Error("Invalid JWT: missing payload segment");
  const json = atob(base64UrlToBinary(payloadPart));
  const parsed: unknown = JSON.parse(json);
  if (!isJwtPayload(parsed)) throw new Error("Invalid JWT payload shape");
  return parsed;
}

export function toSession(raw: ApiLoginResponse, email: string): Session {
  const payload = decodeJwtPayload(raw.data.accessToken);
  return {
    accessToken: raw.data.accessToken,
    refreshToken: raw.data.refreshToken,
    adminUser: {
      id: payload.sub,
      email,
      role: payload.role,
    },
  };
}
