import type { AuditLogDTO } from "@repo/application";
// @max-lines 200 — this is enforced by the lint pipeline.
import { PaginationSchema } from "@repo/contracts";
import type { ApiSuccess, PaginatedMeta } from "@repo/contracts";
import type { IAuditLogRepository } from "@repo/domain";
import type { AppLogger } from "@repo/utils";
import type { NextFunction, Request, Response } from "express";

export class AuditLogController {
  constructor(
    private readonly auditLogRepo: IAuditLogRepository,
    private readonly logger: AppLogger,
  ) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const parsed = PaginationSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: parsed.error.message },
      });
      return;
    }

    const result = await this.auditLogRepo.findAll({
      page: parsed.data.page,
      limit: parsed.data.limit,
    });

    if (!result.ok) return next(result.error);

    const meta: PaginatedMeta = {
      page: result.value.page,
      limit: result.value.limit,
      total: result.value.total,
    };

    res.setHeader("X-Total-Count", result.value.total);
    res.setHeader("X-Page", result.value.page);

    const items: AuditLogDTO[] = result.value.items.map((r) => ({
      id: r.id,
      adminId: r.adminId,
      action: r.action,
      entity: r.entity,
      entityId: r.entityId,
      payload: r.payload,
      ip: r.ip,
      ua: r.ua,
      createdAt: r.createdAt.toISOString(),
    }));

    const body: ApiSuccess<AuditLogDTO[]> = { success: true, data: items, meta };
    res.status(200).json(body);
  };
}
