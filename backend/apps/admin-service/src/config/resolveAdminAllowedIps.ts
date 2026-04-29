/** Default when ADMIN_ALLOWED_IPS is unset or blank (Docker-friendly). */
export const DEFAULT_ADMIN_ALLOWED_IPS = "127.0.0.1,::1,::ffff:127.0.0.1,172.16.0.0/12";

/** Default when unset and Docker bridge must not be allowed. */
export const STRICT_LOOPBACK_DEFAULT_ADMIN_ALLOWED_IPS = "127.0.0.1,::1,::ffff:127.0.0.1";

const DOCKER_BRIDGE_IPV4_CIDR = "172.16.0.0/12";

/**
 * Resolves the raw ADMIN_ALLOWED_IPS string.
 * When `ADMIN_ALLOW_DOCKER_BRIDGE` is not `0`, appends `172.16.0.0/12` if missing so
 * a typical `.env` with only loopbacks still allows Docker bridge peers (e.g. 172.18.x).
 */
export function resolveAdminAllowedIpsRaw(env: NodeJS.ProcessEnv): string {
  const fromEnv = env.ADMIN_ALLOWED_IPS;
  const dockerOff = env.ADMIN_ALLOW_DOCKER_BRIDGE === "0";

  if (typeof fromEnv === "string" && fromEnv.trim().length > 0) {
    const base = fromEnv.trim();
    if (dockerOff) {
      return base;
    }
    const entries = base
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (entries.includes(DOCKER_BRIDGE_IPV4_CIDR)) {
      return base;
    }
    return `${base},${DOCKER_BRIDGE_IPV4_CIDR}`;
  }

  if (dockerOff) {
    return STRICT_LOOPBACK_DEFAULT_ADMIN_ALLOWED_IPS;
  }
  return DEFAULT_ADMIN_ALLOWED_IPS;
}
