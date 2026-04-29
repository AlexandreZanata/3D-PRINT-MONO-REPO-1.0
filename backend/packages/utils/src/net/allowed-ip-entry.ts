import { normalizeIp } from "./normalize-ip.js";

const IPV4_DOTTED_DECIMAL = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

function ipv4OctetToUint(part: string): number | null {
  if (!/^\d{1,3}$/.test(part)) return null;
  const n = Number(part);
  if (n > 255) return null;
  return n;
}

/** Parses IPv4 dotted-quad to uint32, or null if invalid. */
function ipv4ToUint32(ip: string): number | null {
  const m = IPV4_DOTTED_DECIMAL.exec(ip);
  if (!m) return null;
  const a = ipv4OctetToUint(m[1] ?? "");
  const b = ipv4OctetToUint(m[2] ?? "");
  const c = ipv4OctetToUint(m[3] ?? "");
  const d = ipv4OctetToUint(m[4] ?? "");
  if (a === null || b === null || c === null || d === null) return null;
  return ((a << 24) | (b << 16) | (c << 8) | d) >>> 0;
}

function cidrMaskV4(prefixBits: number): number {
  if (prefixBits <= 0) return 0;
  if (prefixBits >= 32) return 0xffffffff;
  return (0xffffffff << (32 - prefixBits)) >>> 0;
}

function ipv4MatchesCidr(clientIp: string, cidrEntry: string): boolean {
  const slash = cidrEntry.indexOf("/");
  if (slash < 0) return false;
  const baseStr = cidrEntry.slice(0, slash).trim();
  const bitsStr = cidrEntry.slice(slash + 1).trim();
  const prefixBits = Number(bitsStr);
  if (!Number.isInteger(prefixBits) || prefixBits < 0 || prefixBits > 32) return false;

  const ipNum = ipv4ToUint32(normalizeIp(clientIp));
  const baseNum = ipv4ToUint32(normalizeIp(baseStr));
  if (ipNum === null || baseNum === null) return false;

  const mask = cidrMaskV4(prefixBits);
  return (ipNum & mask) === (baseNum & mask);
}

/**
 * True if `clientIp` is allowed by one env entry: exact match (after {@link normalizeIp})
 * or IPv4 CIDR (`a.b.c.d/nn`).
 */
export function matchesAllowedIpEntry(clientIp: string, entryRaw: string): boolean {
  const entry = entryRaw.trim();
  if (entry.length === 0) return false;

  const normalizedClient = normalizeIp(clientIp);
  if (entry.includes("/")) {
    return ipv4MatchesCidr(normalizedClient, entry);
  }
  return normalizedClient === normalizeIp(entry);
}
