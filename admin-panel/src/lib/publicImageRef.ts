/** Same rules as `@repo/contracts` `isPublicImageRef` — keep in sync for admin-only bundle. */
export function isPublicImageRef(value: string | undefined | null): boolean {
  if (value == null) return false;
  const t = value.trim();
  if (t.length === 0) return false;
  if (t.startsWith("/api/v1/uploads/")) {
    const rest = t.slice("/api/v1/uploads/".length);
    return rest.length > 0 && /^[\w.-]+$/.test(rest);
  }
  try {
    const u = new URL(t);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
