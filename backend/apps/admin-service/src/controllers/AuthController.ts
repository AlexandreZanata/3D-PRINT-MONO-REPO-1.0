import type { AuthFacade, TokenPairDTO } from "@repo/application";
// @max-lines 200 — this is enforced by the lint pipeline.
import { LoginSchema, RefreshTokenSchema } from "@repo/contracts";
import type { ApiSuccess } from "@repo/contracts";
import type { AppLogger } from "@repo/utils";
import type { NextFunction, Request, Response } from "express";

export class AuthController {
  constructor(
    private readonly facade: AuthFacade,
    private readonly logger: AppLogger,
  ) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: parsed.error.message },
      });
      return;
    }

    const result = await this.facade.login(parsed.data);
    if (!result.ok) return next(result.error);

    this.logger.info({ ip: req.ip }, "Admin login successful");
    const body: ApiSuccess<TokenPairDTO> = { success: true, data: result.value };
    res.status(200).json(body);
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const parsed = RefreshTokenSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: parsed.error.message },
      });
      return;
    }

    const result = await this.facade.refresh(parsed.data.refreshToken);
    if (!result.ok) return next(result.error);

    const body: ApiSuccess<TokenPairDTO> = { success: true, data: result.value };
    res.status(200).json(body);
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const parsed = RefreshTokenSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: parsed.error.message },
      });
      return;
    }

    const result = await this.facade.logout(parsed.data.refreshToken);
    if (!result.ok) return next(result.error);

    res.status(204).send();
  };
}
