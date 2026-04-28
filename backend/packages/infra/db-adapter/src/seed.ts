// @max-lines 200 — this is enforced by the lint pipeline.
import { Admin, Product } from "@repo/domain";
import { createLogger } from "@repo/utils";
import { hash } from "argon2";
import { createDbClient } from "./client.js";
import { DrizzleAdminRepository } from "./repositories/DrizzleAdminRepository.js";
import { DrizzleProductRepository } from "./repositories/DrizzleProductRepository.js";

const logger = createLogger("seed");

async function seed() {
  const { db, close } = createDbClient({
    host: process.env.POSTGRES_HOST ?? "localhost",
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    database: process.env.POSTGRES_DB ?? "ecommerce",
    user: process.env.POSTGRES_USER ?? "postgres",
    password: process.env.POSTGRES_PASSWORD ?? "",
  });

  const productRepo = new DrizzleProductRepository(db);
  const adminRepo = new DrizzleAdminRepository(db);

  // Seed admin user
  const adminId = "01900000-0000-7000-8000-000000000001";
  const passwordHash = await hash("Admin123!");
  const admin = Admin.create({
    id: adminId,
    email: "admin@example.com",
    passwordHash,
    role: "admin",
  });
  const adminResult = await adminRepo.save(admin);
  if (adminResult.ok) {
    logger.info({ email: admin.email.value }, "seeded admin");
  } else {
    logger.error({ error: adminResult.error.message }, "failed to seed admin");
  }

  // Seed products
  const products = [
    {
      id: "01900000-0000-7000-8000-000000000010",
      name: "Geometric Vase",
      description: "Modern 3D-printed vase with geometric patterns",
      price: 49.99,
      stock: 15,
      whatsappNumber: "+5511999999999",
      imageUrl: "https://example.com/vase.jpg",
    },
    {
      id: "01900000-0000-7000-8000-000000000011",
      name: "Desk Organizer",
      description: "Minimalist desk organizer for pens and accessories",
      price: 29.99,
      stock: 30,
      whatsappNumber: "+5511999999999",
    },
  ];

  for (const p of products) {
    const product = Product.create(p);
    const result = await productRepo.save(product);
    if (result.ok) {
      logger.info({ name: p.name }, "seeded product");
    } else {
      logger.error({ error: result.error.message, name: p.name }, "failed to seed product");
    }
  }

  await close();
  logger.info("seed complete");
}

seed().catch((e) => {
  logger.fatal({ error: e }, "seed script crashed");
  process.exit(1);
});
