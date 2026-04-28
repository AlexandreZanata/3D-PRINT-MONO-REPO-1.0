// @max-lines 200 — this is enforced by the lint pipeline.
import { InfraError } from "@repo/utils";
import { err, ok } from "@repo/utils";
import { describe, expect, it, vi } from "vitest";
import { LogoutUseCase } from "./LogoutUseCase.js";

const makeRecord = () => ({
  id: "token-1",
  adminId: "admin-1",
  tokenHash: "hashed-token",
  familyId: "family-1",
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  revokedAt: null,
});

const makeDeps = () => ({
  tokenRepo: {
    findByTokenHash: vi.fn().mockResolvedValue(ok(makeRecord())),
    findByFamilyId: vi.fn(),
    save: vi.fn(),
    revoke: vi.fn(),
    revokeFamily: vi.fn().mockResolvedValue(ok(undefined)),
  },
  hashToken: vi.fn().mockReturnValue("hashed-token"),
});

describe("LogoutUseCase", () => {
  it("should revoke the token family on valid refresh token", async () => {
    const deps = makeDeps();
    const useCase = new LogoutUseCase(deps);

    const result = await useCase.execute("raw-refresh-token");

    expect(result.ok).toBe(true);
    expect(deps.tokenRepo.revokeFamily).toHaveBeenCalledWith("family-1", expect.any(Date));
  });

  it("should return UnauthorizedError when token is not found", async () => {
    const deps = makeDeps();
    deps.tokenRepo.findByTokenHash.mockResolvedValue(ok(null));
    const useCase = new LogoutUseCase(deps);

    const result = await useCase.execute("unknown-token");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain("Token not found");
    }
  });

  it("should not call revokeFamily when token is not found", async () => {
    const deps = makeDeps();
    deps.tokenRepo.findByTokenHash.mockResolvedValue(ok(null));
    const useCase = new LogoutUseCase(deps);

    await useCase.execute("unknown-token");

    expect(deps.tokenRepo.revokeFamily).not.toHaveBeenCalled();
  });

  it("should propagate InfraError from findByTokenHash", async () => {
    const deps = makeDeps();
    const infraErr = new InfraError("DB down", new Error("ECONNREFUSED"), "DB_ERROR");
    deps.tokenRepo.findByTokenHash.mockResolvedValue(err(infraErr));
    const useCase = new LogoutUseCase(deps);

    const result = await useCase.execute("raw-token");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(infraErr);
    }
  });

  it("should propagate InfraError from revokeFamily", async () => {
    const deps = makeDeps();
    const infraErr = new InfraError("DB down", new Error("ECONNREFUSED"), "DB_ERROR");
    deps.tokenRepo.revokeFamily.mockResolvedValue(err(infraErr));
    const useCase = new LogoutUseCase(deps);

    const result = await useCase.execute("raw-token");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(infraErr);
    }
  });
});
