// @max-lines 200 — this is enforced by the lint pipeline.
import { Admin } from "@repo/domain";
import { InfraError } from "@repo/utils";
import { err, ok } from "@repo/utils";
import { describe, expect, it, vi } from "vitest";
import { RefreshTokenUseCase } from "./RefreshTokenUseCase.js";

const makeAdmin = () =>
  Admin.create({
    id: "admin-1",
    email: "admin@example.com",
    passwordHash: "hashed",
    role: "admin",
  });

const makeRecord = (overrides: { revokedAt?: Date | null; expiresAt?: Date } = {}) => ({
  ...makeBaseRecord(),
  ...overrides,
});

function makeBaseRecord() {
  return {
    id: "token-1",
    adminId: "admin-1",
    tokenHash: "hashed-token",
    familyId: "family-1",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    revokedAt: null,
  };
}

const makeDeps = () => ({
  adminRepo: {
    findById: vi.fn().mockResolvedValue(ok(makeAdmin())),
    findByEmail: vi.fn(),
    save: vi.fn(),
    updateLastLogin: vi.fn(),
  },
  tokenRepo: {
    findByTokenHash: vi.fn().mockResolvedValue(ok(makeRecord())),
    findByFamilyId: vi.fn(),
    save: vi.fn().mockResolvedValue(ok(undefined)),
    revoke: vi.fn().mockResolvedValue(ok(undefined)),
    revokeFamily: vi.fn().mockResolvedValue(ok(undefined)),
  },
  signAccessToken: vi.fn().mockReturnValue("new-access-token"),
  generateRefreshToken: vi.fn().mockReturnValue("new-refresh-token"),
  hashToken: vi.fn().mockReturnValue("new-hashed-token"),
  generateId: vi.fn().mockReturnValue("new-token-id"),
  refreshTokenTtlDays: 7,
});

describe("RefreshTokenUseCase", () => {
  it("should return a new token pair on valid refresh token", async () => {
    const deps = makeDeps();
    const useCase = new RefreshTokenUseCase(deps);

    const result = await useCase.execute("raw-refresh-token");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.accessToken).toBe("new-access-token");
      expect(result.value.refreshToken).toBe("new-refresh-token");
    }
  });

  it("should revoke the old token before issuing a new one", async () => {
    const deps = makeDeps();
    const useCase = new RefreshTokenUseCase(deps);

    await useCase.execute("raw-refresh-token");

    expect(deps.tokenRepo.revoke).toHaveBeenCalledWith("token-1", expect.any(Date));
  });

  it("should revoke family and return error when token is already revoked", async () => {
    const deps = makeDeps();
    const revokedAt = new Date(Date.now() - 1000);
    deps.tokenRepo.findByTokenHash.mockResolvedValue(ok(makeRecord({ revokedAt })));
    const useCase = new RefreshTokenUseCase(deps);

    const result = await useCase.execute("reused-token");

    expect(result.ok).toBe(false);
    expect(deps.tokenRepo.revokeFamily).toHaveBeenCalledWith("family-1", expect.any(Date));
  });

  it("should return UnauthorizedError when token is not found", async () => {
    const deps = makeDeps();
    deps.tokenRepo.findByTokenHash.mockResolvedValue(ok(null));
    const useCase = new RefreshTokenUseCase(deps);

    const result = await useCase.execute("unknown-token");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain("Invalid or expired");
    }
  });

  it("should propagate InfraError from findByTokenHash", async () => {
    const deps = makeDeps();
    const infraErr = new InfraError("DB down", new Error("ECONNREFUSED"), "DB_ERROR");
    deps.tokenRepo.findByTokenHash.mockResolvedValue(err(infraErr));
    const useCase = new RefreshTokenUseCase(deps);

    const result = await useCase.execute("raw-token");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(infraErr);
    }
  });
});
