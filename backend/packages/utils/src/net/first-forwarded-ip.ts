/** Leftmost address from an X-Forwarded-For-style value (or the whole string if no comma). */
export function firstForwardedIp(value: string): string {
  const segment = value.split(",")[0];
  return segment === undefined ? "" : segment.trim();
}
