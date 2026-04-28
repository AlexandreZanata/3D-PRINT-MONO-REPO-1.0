import type { ProductDTO, ProductFacade } from "@repo/application";
// @max-lines 200 — this is enforced by the lint pipeline.
import { CreateProductSchema, ListProductsQuerySchema, UpdateProductSchema } from "@repo/contracts";
import type { ApiSuccess, PaginatedMeta } from "@repo/contracts";
import type { AppLogger } from "@repo/utils";
import type { NextFunction, Request, Response } from "express";
import type { JwtPayload } from "../middleware/auth.js";
import type { AuditService } from "../services/AuditService.js";

export class AdminProductController {
  constructor(
    private readonly facade: ProductFacade,
    private readonly audit: AuditService,
    private readonly logger: AppLogger,
  ) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const parsed = ListProductsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: parsed.error.message },
      });
      return;
    }

    const result = await this.facade.list(parsed.data);
    if (!result.ok) return next(result.error);

    const meta: PaginatedMeta = {
      page: result.value.page,
      limit: result.value.limit,
      total: result.value.total,
    };
    res.setHeader("X-Total-Count", result.value.total);
    res.setHeader("X-Page", result.value.page);
    const body: ApiSuccess<ProductDTO[]> = { success: true, data: result.value.items, meta };
    res.status(200).json(body);
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const parsed = CreateProductSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: parsed.error.message },
      });
      return;
    }

    const result = await this.facade.create(parsed.data);
    if (!result.ok) return next(result.error);

    const payload = res.locals.jwtPayload as JwtPayload;
    await this.audit.log({
      adminId: payload.sub,
      action: "create",
      entity: "product",
      entityId: result.value.id,
      payload: parsed.data as Record<string, unknown>,
      req,
    });

    const body: ApiSuccess<ProductDTO> = { success: true, data: result.value };
    res.status(201).json(body);
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params as { id: string };
    const parsed = UpdateProductSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: parsed.error.message },
      });
      return;
    }

    const result = await this.facade.update(id, parsed.data);
    if (!result.ok) return next(result.error);

    const payload = res.locals.jwtPayload as JwtPayload;
    await this.audit.log({
      adminId: payload.sub,
      action: "update",
      entity: "product",
      entityId: id,
      payload: parsed.data as Record<string, unknown>,
      req,
    });

    const body: ApiSuccess<ProductDTO> = { success: true, data: result.value };
    res.status(200).json(body);
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params as { id: string };
    const result = await this.facade.delete(id);
    if (!result.ok) return next(result.error);

    const payload = res.locals.jwtPayload as JwtPayload;
    await this.audit.log({
      adminId: payload.sub,
      action: "delete",
      entity: "product",
      entityId: id,
      payload: {},
      req,
    });

    res.status(204).send();
  };
}
