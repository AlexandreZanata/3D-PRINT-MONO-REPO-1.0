// @max-lines 200 — this is enforced by the lint pipeline.
import type { IRefreshTokenRepository } from "@repo/domain";
import { UnauthorizedError } from "@repo/utils";
import { type Result, err, ok } from "@repo/utils";

export interface LogoutDeps {
  readonly tokenRepo: IRefreshTokenRepository;
  readonly hashToken: (token: string) => string;
}

export class LogoutUseCase {
  constructor(private readonly deps: LogoutDeps) {}

  async execute(rawToken: string): Promise<Result<void, Error>> {
    const hash = this.deps.hashToken(rawToken);
    const found = await this.deps.tokenRepo.findByTokenHash(hash);
    if (!found.ok) return err(found.error);

    if (found.value === null) {
      return err(new UnauthorizedError("Token not found", "INVALID_REFRESH_TOKEN"));
    }

    const result = await this.deps.tokenRepo.revokeFamily(found.value.familyId, new Date());
    if (!result.ok) return err(result.error);

    return ok(undefined);
  }
}
