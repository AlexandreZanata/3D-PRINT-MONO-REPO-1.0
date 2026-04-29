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

  // ── Admin ─────────────────────────────────────────────────────────────────
  const adminId = "01900000-0000-7000-8000-000000000001";
  const passwordHash = await hash("Admin123!");
  const admin = Admin.create({
    id: adminId,
    email: "admin@example.com",
    passwordHash,
    role: "admin",
  });
  const adminResult = await adminRepo.save(admin);
  if (adminResult.ok) logger.info({ email: admin.email.value }, "seeded admin");
  else logger.error({ error: adminResult.error.message }, "failed to seed admin");

  // ── Products ──────────────────────────────────────────────────────────────
  const products: Parameters<typeof Product.create>[0][] = [
    {
      id: "01900000-0000-7000-8000-000000000010",
      name: "Facet Vase",
      slug: "facet-vase",
      tagline: "Low-poly silhouette, hand-finished",
      category: "Decor",
      material: "Matte PLA — Cream",
      dimensions: "18 × 14 × 14 cm",
      description:
        "A sculpted vessel printed in biodegradable PLA and finished by hand. Its faceted geometry catches light differently throughout the day.",
      price: 68,
      stock: 15,
      whatsappNumber: "+5511999999999",
      imageUrl: null,
      images: [],
    },
    {
      id: "01900000-0000-7000-8000-000000000011",
      name: "Curve Desk Lamp",
      slug: "curve-desk-lamp",
      tagline: "Organic form, warm directional glow",
      category: "Lighting",
      material: "Matte ABS — Carbon Black",
      dimensions: "38 × 16 × 14 cm",
      description:
        "A flowing parametric form in matte black, engineered for a steady warm light. Touch dimming, USB-C powered, and weighted for stability.",
      price: 184,
      stock: 8,
      whatsappNumber: "+5511999999999",
      imageUrl: null,
      images: [],
    },
    {
      id: "01900000-0000-7000-8000-000000000012",
      name: "Lattice Bowl",
      slug: "lattice-bowl",
      tagline: "Generative weave, fruit-ready",
      category: "Tableware",
      material: "Food-safe PLA — Sand",
      dimensions: "10 × 22 × 22 cm",
      description:
        "An algorithmically generated lattice that holds fruit, keys, or quiet attention. Each piece is unique — the algorithm never prints the same pattern twice.",
      price: 52,
      stock: 20,
      whatsappNumber: "+5511999999999",
      imageUrl: null,
      images: [],
    },
    {
      id: "01900000-0000-7000-8000-000000000013",
      name: "Geo Planter",
      slug: "geo-planter",
      tagline: "Faceted terracotta, drainage included",
      category: "Decor",
      material: "PLA — Terracotta",
      dimensions: "14 × 16 × 16 cm",
      description:
        "Inspired by mineral formations, printed in a warm terracotta-finish PLA. Includes a removable drainage tray.",
      price: 38,
      stock: 25,
      whatsappNumber: "+5511999999999",
      imageUrl: null,
      images: [],
    },
  ];

  for (const p of products) {
    const product = Product.create(p);
    const result = await productRepo.save(product);
    if (result.ok) logger.info({ name: p.name }, "seeded product");
    else logger.error({ error: result.error.message, name: p.name }, "failed to seed product");
  }

  await close();
  logger.info("seed complete");
}

seed().catch((e) => {
  logger.fatal({ error: e }, "seed script crashed");
  process.exit(1);
});
