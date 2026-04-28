import { createHash, randomBytes, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
// @max-lines 200 — this is enforced by the lint pipeline.
import {
  AuthFacade,
  CreateProductUseCase,
  DeleteProductUseCase,
  GetProductByIdUseCase,
  GetWhatsAppLinkUseCase,
  ListProductsUseCase,
  LoginUseCase,
  LogoutUseCase,
  ProductFacade,
  RefreshTokenUseCase,
  UpdateProductUseCase,
} from "@repo/application";
import {
  DrizzleAdminRepository,
  DrizzleAuditLogRepository,
  DrizzleProductRepository,
  DrizzleRefreshTokenRepository,
  createDbClient,
} from "@repo/db-adapter";
import { createLogger } from "@repo/utils";
import { verify as argon2Verify } from "argon2";
import jwt from "jsonwebtoken";
import { AdminProductController } from "./controllers/AdminProductController.js";
import { AuditLogController } from "./controllers/AuditLogController.js";
import { AuthController } from "./controllers/AuthController.js";
import { AuditService } from "./services/AuditService.js";

function getEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

export interface CompositionRoot {
  readonly authController: AuthController;
  readonly productController: AdminProductController;
  readonly auditLogController: AuditLogController;
  readonly close: () => Promise<void>;
}

export async function buildCompositionRoot(): Promise<CompositionRoot> {
  const logger = createLogger("admin-service");

  const { db, close: closeDb } = createDbClient({
    host: getEnv("POSTGRES_HOST"),
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    database: getEnv("POSTGRES_DB"),
    user: getEnv("POSTGRES_USER"),
    password: getEnv("POSTGRES_PASSWORD"),
  });

  const adminRepo = new DrizzleAdminRepository(db);
  const tokenRepo = new DrizzleRefreshTokenRepository(db);
  const productRepo = new DrizzleProductRepository(db);
  const auditLogRepo = new DrizzleAuditLogRepository(db);

  const privateKey = readFileSync(getEnv("JWT_PRIVATE_KEY_PATH"), "utf-8");
  const accessExpiry = process.env.JWT_ACCESS_TOKEN_EXPIRY ?? "15m";
  const refreshTtlDays = 7;

  const signAccessToken = (adminId: string, role: string): string =>
    // jwt.sign accepts string for expiresIn; cast is safe — value comes from env
    jwt.sign({ sub: adminId, role }, privateKey, {
      algorithm: "RS256",
      expiresIn: accessExpiry,
    } as jwt.SignOptions);

  const hashToken = (token: string): string => createHash("sha256").update(token).digest("hex");

  const generateRefreshToken = (): string => randomBytes(32).toString("hex");

  const loginUseCase = new LoginUseCase({
    adminRepo,
    tokenRepo,
    verifyPassword: (hash, plain) => argon2Verify(hash, plain),
    signAccessToken,
    generateRefreshToken,
    hashToken,
    generateId: randomUUID,
    refreshTokenTtlDays: refreshTtlDays,
  });

  const refreshUseCase = new RefreshTokenUseCase({
    adminRepo,
    tokenRepo,
    signAccessToken,
    generateRefreshToken,
    hashToken,
    generateId: randomUUID,
    refreshTokenTtlDays: refreshTtlDays,
  });

  const logoutUseCase = new LogoutUseCase({ tokenRepo, hashToken });

  const authFacade = new AuthFacade({
    login: loginUseCase,
    refreshToken: refreshUseCase,
    logout: logoutUseCase,
  });

  const productFacade = new ProductFacade({
    listProducts: new ListProductsUseCase(productRepo),
    getProductById: new GetProductByIdUseCase(productRepo),
    createProduct: new CreateProductUseCase({ productRepo, generateId: randomUUID }),
    updateProduct: new UpdateProductUseCase(productRepo),
    deleteProduct: new DeleteProductUseCase(productRepo),
    getWhatsAppLink: new GetWhatsAppLinkUseCase(productRepo),
  });

  const auditService = new AuditService(auditLogRepo, logger);

  return {
    authController: new AuthController(authFacade, logger),
    productController: new AdminProductController(productFacade, auditService, logger),
    auditLogController: new AuditLogController(auditLogRepo, logger),
    close: closeDb,
  };
}
