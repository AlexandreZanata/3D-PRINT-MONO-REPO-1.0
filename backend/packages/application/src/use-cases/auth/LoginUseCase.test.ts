// @max-lines 200 — this is enforced by the lint pipeline.
import { Admin } from "@repo/domain";
import { InfraError } from "@repo/utils";
import { err, ok } from "@repo/utils";
import { describe, expect, it, vi } from "vitest";
import { LoginUseCase } from "./LoginUseCase.js";

const makeAdmin = () =>
  Admin.create({
    id: "admin-1",
    email: "admin@example.com",
    passwordHash: "hashed",
    role: "admin",
  });

const makeDeps = (overrides: Partial<Parameters<typeof LoginUseCase.prototype.execute>[0]> = {}) => ({
  adminRepo: {
    findById: vi.fn(),
    findByEmail: vi.fn().mockResolvedValue(ok(makeAdmin())),
    save: vi.fn(),
    updateLastLogin: vi.fn().mockResolvedValue(ok(undefined)),
  },
  tokenRepo: {
    findByTokenHash: vi.fn(),
    findByFamilyId: vi.fn(),
    save: vi.fn().mockResolvedValue(ok(undefined)),
    revoke: vi.fn(),
    revokeFamily: vi.fn(),
  },
  verifyPassword: vi.fn().mockResolvedValue(true),
  signAccessToken: vi.fn().mockReturnValue("access-token"),
  generateRefreshToken: vi.fn().mockReturnValue("refresh-token"),
  hashToken: vi.fn().mockReturnValue("hashed-token"),
  generateId: vi.fn().mockReturnValue("new-id"),
  refreshTokenTtlDays: 7,
});

describe("LoginUseCase", () => {
  it("should return token pair on valid credentials", async () => {
    const deps = makeDeps();
    const useCase = new LoginUseCase(deps);
    const result = await useCase.execute({ email: "admin@example.com", password: "Admin123!" });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.accessToken).toBe("access-token");
      expect(result.value.refreshToken).toBe("refresh-token");
    }
  });

  it("should return UnauthorizedError when admin not found", async () => {
    const deps = makeDeps();
    deps.adminRepo.findByEmail.mockResolvedValue(ok(null));

    const useCase = new LoginUseCase(deps);
    const result = await useCase.execute({ email: "unknown@example.com", password: "pass" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain("Invalid credentials");
    }
  });

  it("should return UnauthorizedError when password is wrong", async () => {
    const deps = makeDeps();
    deps.verifyPassword.mockResolvedValue(false);

    const useCase = new LoginUseCase(deps);
    const result = await useCase.execute({ email: "admin@example.com", password: "wrong" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain("Invalid credentials");
    }
  });

  it("should propagate InfraError from repository", async () => {
    const deps = makeDeps();
    const infraErr = new InfraError("DB down", new Error("ECONNREFUSED"));
    deps.adminRepo.findByEmail.mockResolvedValue(err(infraErr));

    const useCase = new LoginUseCase(deps);
    const result = await useCase.execute({ email: "admin@example.com", password: "pass" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(infraErr);
    }
  });
});
