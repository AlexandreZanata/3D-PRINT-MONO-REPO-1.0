// @max-lines 200 — this is enforced by the lint pipeline.
import type { ISiteSettingsRepository } from "@repo/domain";
import { type Result, err, ok } from "@repo/utils";
import type { SiteSettingsDTO } from "../../dtos/ProductDTO.js";

export class GetSiteSettingsUseCase {
  constructor(private readonly settingsRepo: ISiteSettingsRepository) {}

  async execute(): Promise<Result<SiteSettingsDTO, Error>> {
    const result = await this.settingsRepo.findAll();
    if (!result.ok) return err(result.error);
    return ok(result.value as SiteSettingsDTO);
  }
}
