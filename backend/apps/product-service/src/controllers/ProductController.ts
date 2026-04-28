import type { ProductDTO } from "@repo/application";
// @max-lines 200 — this is enforced by the lint pipeline.
import { ListProductsQuerySchema } from "@repo/contracts";
import type { ApiSuccess, PaginatedMeta } from "@repo/contracts";
import type { AppLogger } from "@repo/utils";
import type { NextFunction, Request, Response } from "express";
import type { EventingProductFacade } from "../facades/EventingProductFacade.js";

export class ProductController {
  constructor(
    private readonly facade: EventingProductFacade,
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

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params as { id: string };
    const result = await this.facade.getById(id);
    if (!result.ok) return next(result.error);
    const body: ApiSuccess<ProductDTO> = { success: true, data: result.value };
    res.status(200).json(body);
  };

  whatsApp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params as { id: string };
    const result = await this.facade.whatsAppLink(id);
    if (!result.ok) return next(result.error);
    const body: ApiSuccess<{ url: string }> = { success: true, data: result.value };
    res.status(200).json(body);
  };
}
