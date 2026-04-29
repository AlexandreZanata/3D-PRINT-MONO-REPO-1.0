// @max-lines 200 — this is enforced by the lint pipeline.
import type { SiteSettingsDTO, SiteSettingsFacade } from "@repo/application";
import type { ApiSuccess } from "@repo/contracts";
import { UpdateSiteSettingsSchema } from "@repo/contracts";
import { type AppLogger, UnauthorizedError } from "@repo/utils";
import type { NextFunction, Request, Response } from "express";
import { isJwtPayload } from "../middleware/auth.js";
import type { AuditService } from "../services/AuditService.js";

export class AdminSiteSettingsController {
  constructor(
    private readonly facade: SiteSettingsFacade,
    private readonly audit: AuditService,
    private readonly logger: AppLogger,
  ) {}

  /** GET /api/v1/admin/site-settings */
  get = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    const result = await this.facade.get();
    if (!result.ok) return next(result.error);
    const body: ApiSuccess<SiteSettingsDTO> = { success: true, data: result.value };
    res.status(200).json(body);
  };

  /** PUT /api/v1/admin/site-settings */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const parsed = UpdateSiteSettingsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: parsed.error.message },
      });
      return;
    }

    const result = await this.facade.update(parsed.data.settings);
    if (!result.ok) return next(result.error);

    const payload = res.locals.jwtPayload;
    if (!isJwtPayload(payload)) {
      return next(new UnauthorizedError("JWT payload missing after auth", "MISSING_SESSION"));
    }
    await this.audit.log({
      adminId: payload.sub,
      action: "update",
      entity: "site_settings",
      entityId: "global",
      payload: parsed.data.settings as Record<string, unknown>,
      req,
    });

    const body: ApiSuccess<SiteSettingsDTO> = { success: true, data: result.value };
    res.status(200).json(body);
  };
}
