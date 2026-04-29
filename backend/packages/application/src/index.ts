// @max-lines 200 — this is enforced by the lint pipeline.
// DTOs
export type { ProductDTO, AuditLogDTO, TokenPairDTO, SiteSettingsDTO } from "./dtos/index.js";

// Mappers
export { toProductDTO } from "./mappers/product.mapper.js";

// Product use cases
export { ListProductsUseCase } from "./use-cases/product/ListProductsUseCase.js";
export type { ListProductsResult } from "./use-cases/product/ListProductsUseCase.js";
export { GetProductByIdUseCase } from "./use-cases/product/GetProductByIdUseCase.js";
export { CreateProductUseCase } from "./use-cases/product/CreateProductUseCase.js";
export type { CreateProductDeps } from "./use-cases/product/CreateProductUseCase.js";
export { UpdateProductUseCase } from "./use-cases/product/UpdateProductUseCase.js";
export { DeleteProductUseCase } from "./use-cases/product/DeleteProductUseCase.js";
export { GetWhatsAppLinkUseCase } from "./use-cases/product/GetWhatsAppLinkUseCase.js";
export type { WhatsAppLinkResult } from "./use-cases/product/GetWhatsAppLinkUseCase.js";

// Site settings use cases
export { GetSiteSettingsUseCase } from "./use-cases/site-settings/GetSiteSettingsUseCase.js";
export { UpdateSiteSettingsUseCase } from "./use-cases/site-settings/UpdateSiteSettingsUseCase.js";

// Auth use cases
export { LoginUseCase } from "./use-cases/auth/LoginUseCase.js";
export type { LoginDeps } from "./use-cases/auth/LoginUseCase.js";
export { RefreshTokenUseCase } from "./use-cases/auth/RefreshTokenUseCase.js";
export type { RefreshTokenDeps } from "./use-cases/auth/RefreshTokenUseCase.js";
export { LogoutUseCase } from "./use-cases/auth/LogoutUseCase.js";
export type { LogoutDeps } from "./use-cases/auth/LogoutUseCase.js";

// Facades
export { ProductFacade } from "./facades/ProductFacade.js";
export type { ProductFacadeDeps } from "./facades/ProductFacade.js";
export { AuthFacade } from "./facades/AuthFacade.js";
export type { AuthFacadeDeps } from "./facades/AuthFacade.js";
export { SiteSettingsFacade } from "./facades/SiteSettingsFacade.js";
export type { SiteSettingsFacadeDeps } from "./facades/SiteSettingsFacade.js";
