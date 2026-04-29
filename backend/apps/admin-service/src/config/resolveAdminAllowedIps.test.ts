import { describe, expect, it } from "vitest";
import {
  DEFAULT_ADMIN_ALLOWED_IPS,
  STRICT_LOOPBACK_DEFAULT_ADMIN_ALLOWED_IPS,
  resolveAdminAllowedIpsRaw,
} from "./resolveAdminAllowedIps.js";

describe("resolveAdminAllowedIpsRaw", () => {
  it("uses default when ADMIN_ALLOWED_IPS is unset", () => {
    expect(resolveAdminAllowedIpsRaw({})).toBe(DEFAULT_ADMIN_ALLOWED_IPS);
  });

  it("uses default when ADMIN_ALLOWED_IPS is blank", () => {
    expect(resolveAdminAllowedIpsRaw({ ADMIN_ALLOWED_IPS: "  " })).toBe(DEFAULT_ADMIN_ALLOWED_IPS);
  });

  it("appends Docker CIDR when env lists only loopbacks", () => {
    expect(resolveAdminAllowedIpsRaw({ ADMIN_ALLOWED_IPS: "127.0.0.1,::1" })).toBe(
      "127.0.0.1,::1,172.16.0.0/12",
    );
  });

  it("does not duplicate Docker CIDR when already present", () => {
    expect(
      resolveAdminAllowedIpsRaw({
        ADMIN_ALLOWED_IPS: "127.0.0.1,172.16.0.0/12",
      }),
    ).toBe("127.0.0.1,172.16.0.0/12");
  });

  it("skips append when ADMIN_ALLOW_DOCKER_BRIDGE is 0", () => {
    expect(
      resolveAdminAllowedIpsRaw({
        ADMIN_ALLOWED_IPS: "127.0.0.1,::1",
        ADMIN_ALLOW_DOCKER_BRIDGE: "0",
      }),
    ).toBe("127.0.0.1,::1");
  });

  it("uses strict loopback default when env unset and Docker bridge disabled", () => {
    expect(
      resolveAdminAllowedIpsRaw({
        ADMIN_ALLOW_DOCKER_BRIDGE: "0",
      }),
    ).toBe(STRICT_LOOPBACK_DEFAULT_ADMIN_ALLOWED_IPS);
  });
});
