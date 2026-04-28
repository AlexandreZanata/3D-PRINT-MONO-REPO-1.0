// @max-lines 200 — this is enforced by the lint pipeline.
import type { LoginDTO } from "@repo/contracts";
import type { Result } from "@repo/utils";
import type { TokenPairDTO } from "../dtos/ProductDTO.js";
import type { LoginUseCase } from "../use-cases/auth/LoginUseCase.js";
import type { LogoutUseCase } from "../use-cases/auth/LogoutUseCase.js";
import type { RefreshTokenUseCase } from "../use-cases/auth/RefreshTokenUseCase.js";

export interface AuthFacadeDeps {
  readonly login: LoginUseCase;
  readonly refreshToken: RefreshTokenUseCase;
  readonly logout: LogoutUseCase;
}

/**
 * Orchestrates authentication use cases.
 * Controllers call exactly one method on this facade.
 */
export class AuthFacade {
  constructor(private readonly deps: AuthFacadeDeps) {}

  login(dto: LoginDTO): Promise<Result<TokenPairDTO, Error>> {
    return this.deps.login.execute(dto);
  }

  refresh(rawToken: string): Promise<Result<TokenPairDTO, Error>> {
    return this.deps.refreshToken.execute(rawToken);
  }

  logout(rawToken: string): Promise<Result<void, Error>> {
    return this.deps.logout.execute(rawToken);
  }
}
