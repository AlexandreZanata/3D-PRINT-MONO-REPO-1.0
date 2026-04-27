// @max-lines 200 — this is enforced by the lint pipeline.
import type { InfraError } from "../common/InfraError.js";
import type { Result } from "../common/Result.js";
import type { PaginatedResult, PaginationOptions } from "./IProductRepository.js";

export interface AuditLogRecord {
  readonly id: string;
  readonly adminId: string;
  readonly action: string;
  readonly entity: string;
  readonly entityId: string;
  readonly payload: Record<string, unknown>;
  readonly ip: string;
  readonly ua: string;
  readonly createdAt: Date;
}

export interface IAuditLogRepository {
  save(record: AuditLogRecord): Promise<Result<void, InfraError>>;
  findAll(pagination: PaginationOptions): Promise<Result<PaginatedResult<AuditLogRecord>, InfraError>>;
}
