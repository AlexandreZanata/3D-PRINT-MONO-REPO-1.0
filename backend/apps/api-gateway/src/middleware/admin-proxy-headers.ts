import type { IncomingHttpHeaders } from "node:http";
import { normalizeIp } from "@repo/utils";

/** Value for `X-Forwarded-For` from the TCP peer seen by the api-gateway (allowlist input). */
export function forwardedForValueFromSocketPeer(peer: string | undefined): string {
  return normalizeIp(peer ?? "");
}

/** Clones incoming headers and sets `x-forwarded-for` to the gateway peer address. */
export function withAdminUpstreamForwardedFor(
  incoming: IncomingHttpHeaders,
  peer: string | undefined,
): IncomingHttpHeaders {
  const out: Record<string, string | string[] | undefined> = { ...incoming };
  out["x-forwarded-for"] = forwardedForValueFromSocketPeer(peer);
  return out;
}
