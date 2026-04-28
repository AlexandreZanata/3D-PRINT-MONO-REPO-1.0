// @max-lines 200 — this is enforced by the lint pipeline.
import type { InfraError } from "../common/index.js";
import type { Result } from "../common/Result.js";
import type { Admin } from "../entities/Admin.js";

export interface IAdminRepository {
  findById(id: string): Promise<Result<Admin | null, InfraError>>;
  findByEmail(email: string): Promise<Result<Admin | null, InfraError>>;
  save(admin: Admin): Promise<Result<void, InfraError>>;
  updateLastLogin(id: string, at: Date): Promise<Result<void, InfraError>>;
}
