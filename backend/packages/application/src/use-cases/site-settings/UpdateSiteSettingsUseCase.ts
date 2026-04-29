// @max-lines 200 — this is enforced by the lint pipeline.
import type { ISiteSettingsRepository } from "@repo/domain";
import { type Result, err, ok } from "@repo/utils";
import type { SiteSettingsDTO } from "../../dtos/ProductDTO.js";

export class UpdateSiteSettingsUseCase {
  constructor(private readonly settingsRepo: ISiteSettingsRepository) {}

  async execute(entries: Record<string, string>): Promise<Result<SiteSettingsDTO, Error>> {
    const upsertResult = await this.settingsRepo.upsertMany(entries);
    if (!upsertResult.ok) return err(upsertResult.error);

    const findResult = await this.settingsRepo.findAll();
    if (!findResult.ok) return err(findResult.error);

    return ok(findResult.value as SiteSettingsDTO);
  }
}
