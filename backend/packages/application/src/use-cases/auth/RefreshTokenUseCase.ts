// @max-lines 200 — this is enforced by the lint pipeline.
import type { IAdminRepository, IRefreshTokenRepository } from "@repo/domain";
import { UnauthorizedError } from "@repo/utils";
import { type Result, err, ok } from "@repo/utils";
import type { TokenPairDTO } from "../../dtos/ProductDTO.js";

export interface RefreshTokenDeps {
  readonly adminRepo: IAdminRepository;
  readonly tokenRepo: IRefreshTokenRepository;
  readonly signAccessToken: (adminId: string, role: string) => string;
  readonly generateRefreshToken: () => string;
  readonly hashToken: (token: string) => string;
  readonly generateId: () => string;
  readonly refreshTokenTtlDays: number;
}

export class RefreshTokenUseCase {
  constructor(private readonly deps: RefreshTokenDeps) {}

  async execute(rawToken: string): Promise<Result<TokenPairDTO, Error>> {
    const hash = this.deps.hashToken(rawToken);
    const found = await this.deps.tokenRepo.findByTokenHash(hash);
    if (!found.ok) return err(found.error);

    const record = found.value;
    if (record === null || record.revokedAt !== null || record.expiresAt < new Date()) {
      if (record !== null) {
        await this.deps.tokenRepo.revokeFamily(record.familyId, new Date());
      }
      return err(
        new UnauthorizedError("Invalid or expired refresh token", "INVALID_REFRESH_TOKEN"),
      );
    }

    await this.deps.tokenRepo.revoke(record.id, new Date());

    const adminResult = await this.deps.adminRepo.findById(record.adminId);
    if (!adminResult.ok) return err(adminResult.error);
    if (adminResult.value === null) {
      return err(new UnauthorizedError("Admin not found", "ADMIN_NOT_FOUND"));
    }

    const admin = adminResult.value;
    const accessToken = this.deps.signAccessToken(admin.id, admin.role);
    const newRefreshToken = this.deps.generateRefreshToken();
    const newHash = this.deps.hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + this.deps.refreshTokenTtlDays * 24 * 60 * 60 * 1000);

    const saveResult = await this.deps.tokenRepo.save({
      id: this.deps.generateId(),
      adminId: admin.id,
      tokenHash: newHash,
      familyId: record.familyId,
      expiresAt,
      revokedAt: null,
    });

    if (!saveResult.ok) return err(saveResult.error);

    return ok({ accessToken, refreshToken: newRefreshToken });
  }
}
