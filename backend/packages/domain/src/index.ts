// @max-lines 200 — this is enforced by the lint pipeline.
export type { Result } from "./common/Result.js";
export { DomainError } from "./common/DomainError.js";
export { InfraError } from "./common/InfraError.js";

export { Product } from "./entities/Product.js";
export type { ProductProps, CreateProductInput } from "./entities/Product.js";
export { Admin } from "./entities/Admin.js";
export type { AdminProps, CreateAdminInput, AdminRole } from "./entities/Admin.js";
export { SiteSetting } from "./entities/SiteSettings.js";
export type { SiteSettingProps, SiteSettingsMap } from "./entities/SiteSettings.js";

export { PriceVO } from "./value-objects/PriceVO.js";
export { WhatsAppNumberVO } from "./value-objects/WhatsAppNumberVO.js";
export { EmailVO } from "./value-objects/EmailVO.js";

export type { DomainEvent } from "./events/DomainEvent.js";
export type { ProductCreatedEvent } from "./events/ProductCreatedEvent.js";
export type { ProductUpdatedEvent } from "./events/ProductUpdatedEvent.js";
export type { ProductDeletedEvent } from "./events/ProductDeletedEvent.js";

export type {
  IProductRepository,
  ProductFilters,
  PaginationOptions,
  PaginatedResult,
} from "./repositories/IProductRepository.js";
export type { IAdminRepository } from "./repositories/IAdminRepository.js";
export type {
  IRefreshTokenRepository,
  RefreshTokenRecord,
} from "./repositories/IRefreshTokenRepository.js";
export type { IAuditLogRepository, AuditLogRecord } from "./repositories/IAuditLogRepository.js";
export type { ISiteSettingsRepository } from "./repositories/ISiteSettingsRepository.js";

export type { QueuePublisher, QueueMessage } from "./interfaces/QueuePublisher.js";
export type { QueueConsumer, MessageHandler } from "./interfaces/QueueConsumer.js";
export type { RedisClient } from "./interfaces/RedisClient.js";
