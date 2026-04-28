import { randomUUID } from "node:crypto";
// @max-lines 200 — this is enforced by the lint pipeline.
import type { IAuditLogRepository } from "@repo/domain";
import type { AppLogger } from "@repo/utils";
import type { Request } from "express";

export interface AuditLogInput {
  readonly adminId: string;
  readonly action: string;
  readonly entity: string;
  readonly entityId: string;
  readonly payload: Record<string, unknown>;
  readonly req: Request;
}

/**
 * Writes an audit log entry for every admin mutation.
 * Failures are logged but do not propagate — audit must not break the main flow.
 */
export class AuditService {
  constructor(
    private readonly auditLogRepo: IAuditLogRepository,
    private readonly logger: AppLogger,
  ) {}

  async log(input: AuditLogInput): Promise<void> {
    const ip = input.req.ip ?? "unknown";
    const ua = input.req.headers["user-agent"] ?? "unknown";

    const result = await this.auditLogRepo.save({
      id: randomUUID(),
      adminId: input.adminId,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      payload: input.payload,
      ip,
      ua,
      createdAt: new Date(),
    });

    if (!result.ok) {
      this.logger.warn(
        { adminId: input.adminId, action: input.action, error: result.error.message },
        "Failed to write audit log",
      );
    }
  }
}
