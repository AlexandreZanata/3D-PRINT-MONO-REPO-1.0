import type { Result } from "../common/Result.js";
// @max-lines 200 — this is enforced by the lint pipeline.
import type { InfraError } from "../common/index.js";

export interface RefreshTokenRecord {
  readonly id: string;
  readonly adminId: string;
  readonly tokenHash: string;
  readonly familyId: string;
  readonly expiresAt: Date;
  readonly revokedAt: Date | null;
}

export interface IRefreshTokenRepository {
  findByTokenHash(hash: string): Promise<Result<RefreshTokenRecord | null, InfraError>>;
  findByFamilyId(familyId: string): Promise<Result<RefreshTokenRecord[], InfraError>>;
  save(record: RefreshTokenRecord): Promise<Result<void, InfraError>>;
  revoke(id: string, at: Date): Promise<Result<void, InfraError>>;
  revokeFamily(familyId: string, at: Date): Promise<Result<void, InfraError>>;
}
