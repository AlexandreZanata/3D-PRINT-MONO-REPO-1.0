import { randomUUID } from "node:crypto";
// @max-lines 200 — this is enforced by the lint pipeline.
import {
  CreateProductUseCase,
  DeleteProductUseCase,
  GetProductByIdUseCase,
  GetSiteSettingsUseCase,
  GetWhatsAppLinkUseCase,
  ListProductsUseCase,
  ProductFacade,
  SiteSettingsFacade,
  UpdateProductUseCase,
  UpdateSiteSettingsUseCase,
} from "@repo/application";
import { IoRedisClient } from "@repo/cache-adapter";
import {
  DrizzleProductRepository,
  DrizzleSiteSettingsRepository,
  createDbClient,
} from "@repo/db-adapter";
import { ROUTING_KEYS, RabbitMQPublisher } from "@repo/queue-adapter";
import { SSEManager } from "@repo/sse-adapter";
import { createLogger } from "@repo/utils";
import { ProductController } from "./controllers/ProductController.js";
import { SiteSettingsController } from "./controllers/SiteSettingsController.js";
import { SseController } from "./controllers/SseController.js";
import { EventingProductFacade } from "./facades/EventingProductFacade.js";

function getEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

export interface CompositionRoot {
  readonly productController: ProductController;
  readonly siteSettingsController: SiteSettingsController;
  readonly sseController: SseController;
  readonly close: () => Promise<void>;
}

export async function buildCompositionRoot(): Promise<CompositionRoot> {
  const logger = createLogger("product-service");

  const { db, close: closeDb } = createDbClient({
    host: getEnv("POSTGRES_HOST"),
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    database: getEnv("POSTGRES_DB"),
    user: getEnv("POSTGRES_USER"),
    password: getEnv("POSTGRES_PASSWORD"),
  });

  const redisPassword = process.env.REDIS_PASSWORD;
  const redis = new IoRedisClient({
    host: process.env.REDIS_HOST ?? "localhost",
    port: Number(process.env.REDIS_PORT ?? 6379),
    ...(redisPassword !== undefined ? { password: redisPassword } : {}),
  });

  const rabbitUrl =
    process.env.RABBITMQ_URL ??
    `amqp://${process.env.RABBITMQ_USER ?? "guest"}:${process.env.RABBITMQ_PASSWORD ?? "guest"}@${process.env.RABBITMQ_HOST ?? "localhost"}:${process.env.RABBITMQ_PORT ?? 5672}`;
  const publisher = new RabbitMQPublisher({ url: rabbitUrl });
  await publisher.connect();

  const sseManager = new SSEManager(
    {
      maxConnections: Number(process.env.SSE_MAX_CONNECTIONS ?? 500),
      heartbeatIntervalMs: 30000,
    },
    logger,
  );

  const productRepo = new DrizzleProductRepository(db);
  const settingsRepo = new DrizzleSiteSettingsRepository(db);

  const listProducts = new ListProductsUseCase(productRepo);
  const getProductById = new GetProductByIdUseCase(productRepo);
  const getWhatsAppLink = new GetWhatsAppLinkUseCase(productRepo);
  const createProduct = new CreateProductUseCase({ productRepo, generateId: randomUUID });
  const updateProduct = new UpdateProductUseCase(productRepo);
  const deleteProduct = new DeleteProductUseCase(productRepo);

  const baseFacade = new ProductFacade({
    listProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getWhatsAppLink,
  });

  const productFacade = new EventingProductFacade(
    baseFacade,
    publisher,
    sseManager,
    ROUTING_KEYS,
    logger,
  );

  const siteSettingsFacade = new SiteSettingsFacade({
    getSettings: new GetSiteSettingsUseCase(settingsRepo),
    updateSettings: new UpdateSiteSettingsUseCase(settingsRepo),
  });

  const productController = new ProductController(productFacade, logger);
  const siteSettingsController = new SiteSettingsController(siteSettingsFacade, logger);
  const sseController = new SseController(sseManager, redis, logger);

  return {
    productController,
    siteSettingsController,
    sseController,
    close: async () => {
      sseManager.close();
      await publisher.close();
      await closeDb();
    },
  };
}
