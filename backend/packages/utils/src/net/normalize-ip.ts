/** Normalizes Node / Express IPv4-mapped IPv6 addresses for allowlist and logging. */
export function normalizeIp(ip: string): string {
  if (ip.startsWith("::ffff:")) {
    return ip.slice("::ffff:".length);
  }
  return ip;
}
