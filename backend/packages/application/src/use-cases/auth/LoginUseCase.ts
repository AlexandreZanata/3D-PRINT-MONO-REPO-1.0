// @max-lines 200 — this is enforced by the lint pipeline.
import type { IAdminRepository, IRefreshTokenRepository } from "@repo/domain";
import type { LoginDTO } from "@repo/contracts";
import { UnauthorizedError } from "@repo/utils";
import { type Result, err, ok } from "@repo/utils";
import type { TokenPairDTO } from "../../dtos/ProductDTO.js";

export interface LoginDeps {
  readonly adminRepo: IAdminRepository;
  readonly tokenRepo: IRefreshTokenRepository;
  readonly verifyPassword: (hash: string, plain: string) => Promise<boolean>;
  readonly signAccessToken: (adminId: string, role: string) => string;
  readonly generateRefreshToken: () => string;
  readonly hashToken: (token: string) => string;
  readonly generateId: () => string;
  readonly refreshTokenTtlDays: number;
}

export class LoginUseCase {
  constructor(private readonly deps: LoginDeps) {}

  async execute(dto: LoginDTO): Promise<Result<TokenPairDTO, Error>> {
    const adminResult = await this.deps.adminRepo.findByEmail(dto.email);
    if (!adminResult.ok) return err(adminResult.error);

    const admin = adminResult.value;
    if (admin === null) {
      return err(new UnauthorizedError("Invalid credentials", "INVALID_CREDENTIALS"));
    }

    const valid = await this.deps.verifyPassword(admin.passwordHash, dto.password);
    if (!valid) {
      return err(new UnauthorizedError("Invalid credentials", "INVALID_CREDENTIALS"));
    }

    const accessToken = this.deps.signAccessToken(admin.id, admin.role);
    const refreshToken = this.deps.generateRefreshToken();
    const tokenHash = this.deps.hashToken(refreshToken);
    const familyId = this.deps.generateId();
    const expiresAt = new Date(
      Date.now() + this.deps.refreshTokenTtlDays * 24 * 60 * 60 * 1000,
    );

    const saveResult = await this.deps.tokenRepo.save({
      id: this.deps.generateId(),
      adminId: admin.id,
      tokenHash,
      familyId,
      expiresAt,
      revokedAt: null,
    });

    if (!saveResult.ok) return err(saveResult.error);

    await this.deps.adminRepo.updateLastLogin(admin.id, new Date());

    return ok({ accessToken, refreshToken });
  }
}
