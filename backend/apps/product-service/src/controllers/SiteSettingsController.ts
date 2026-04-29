// @max-lines 200 — this is enforced by the lint pipeline.
import type { SiteSettingsDTO, SiteSettingsFacade } from "@repo/application";
import type { ApiSuccess } from "@repo/contracts";
import type { AppLogger } from "@repo/utils";
import type { NextFunction, Request, Response } from "express";

/**
 * Public (unauthenticated) read-only endpoint for site settings.
 * The frontend fetches this on every page load to render hero content, etc.
 */
export class SiteSettingsController {
  constructor(
    private readonly facade: SiteSettingsFacade,
    private readonly logger: AppLogger,
  ) {}

  /** GET /api/v1/site-settings */
  get = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    const result = await this.facade.get();
    if (!result.ok) return next(result.error);
    const body: ApiSuccess<SiteSettingsDTO> = { success: true, data: result.value };
    res.status(200).json(body);
  };
}
