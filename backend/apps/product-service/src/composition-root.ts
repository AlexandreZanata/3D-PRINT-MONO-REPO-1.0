import { randomUUID } from "node:crypto";
// @max-lines 200 — this is enforced by the lint pipeline.
import {
  CreateProductUseCase,
  DeleteProductUseCase,
  GetProductByIdUseCase,
  GetWhatsAppLinkUseCase,
  ListProductsUseCase,
  ProductFacade,
  UpdateProductUseCase,
} from "@repo/application";
import { IoRedisClient } from "@repo/cache-adapter";
import { DrizzleProductRepository, createDbClient } from "@repo/db-adapter";
import { ROUTING_KEYS, RabbitMQPublisher } from "@repo/queue-adapter";
import { SSEManager } from "@repo/sse-adapter";
import { createLogger } from "@repo/utils";
import { ProductController } from "./controllers/ProductController.js";
import { SseController } from "./controllers/SseController.js";
import { EventingProductFacade } from "./facades/EventingProductFacade.js";

function getEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

export interface CompositionRoot {
  readonly productController: ProductController;
  readonly sseController: SseController;
  readonly close: () => Promise<void>;
}

export async function buildCompositionRoot(): Promise<CompositionRoot> {
  const logger = createLogger("product-service");

  // ── Database ──────────────────────────────────────────────────────────────
  const { db, close: closeDb } = createDbClient({
    host: getEnv("POSTGRES_HOST"),
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    database: getEnv("POSTGRES_DB"),
    user: getEnv("POSTGRES_USER"),
    password: getEnv("POSTGRES_PASSWORD"),
  });

  // ── Redis ─────────────────────────────────────────────────────────────────
  const redisPassword = process.env.REDIS_PASSWORD;
  const redis = new IoRedisClient({
    host: process.env.REDIS_HOST ?? "localhost",
    port: Number(process.env.REDIS_PORT ?? 6379),
    ...(redisPassword !== undefined ? { password: redisPassword } : {}),
  });

  // ── RabbitMQ ──────────────────────────────────────────────────────────────
  const rabbitUrl =
    process.env.RABBITMQ_URL ??
    `amqp://${process.env.RABBITMQ_USER ?? "guest"}:${process.env.RABBITMQ_PASSWORD ?? "guest"}@${process.env.RABBITMQ_HOST ?? "localhost"}:${process.env.RABBITMQ_PORT ?? 5672}`;
  const publisher = new RabbitMQPublisher({ url: rabbitUrl });
  await publisher.connect();

  // ── SSE ───────────────────────────────────────────────────────────────────
  const sseManager = new SSEManager(
    {
      maxConnections: Number(process.env.SSE_MAX_CONNECTIONS ?? 500),
      heartbeatIntervalMs: 30000,
    },
    logger,
  );

  // ── Repositories ──────────────────────────────────────────────────────────
  const productRepo = new DrizzleProductRepository(db);

  // ── Use Cases ─────────────────────────────────────────────────────────────
  const listProducts = new ListProductsUseCase(productRepo);
  const getProductById = new GetProductByIdUseCase(productRepo);
  const getWhatsAppLink = new GetWhatsAppLinkUseCase(productRepo);
  const createProduct = new CreateProductUseCase({ productRepo, generateId: randomUUID });
  const updateProduct = new UpdateProductUseCase(productRepo);
  const deleteProduct = new DeleteProductUseCase(productRepo);

  // ── Facade (with eventing wrapper) ────────────────────────────────────────
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

  const productController = new ProductController(productFacade, logger);
  const sseController = new SseController(sseManager, redis, logger);

  return {
    productController,
    sseController,
    close: async () => {
      sseManager.close();
      await publisher.close();
      await closeDb();
    },
  };
}
