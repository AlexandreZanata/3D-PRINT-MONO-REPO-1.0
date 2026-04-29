// @max-lines 200 — this is enforced by the lint pipeline.
import { Admin, Product } from "@repo/domain";
import { createLogger } from "@repo/utils";
import { hash } from "argon2";
import { eq } from "drizzle-orm";
import { createDbClient } from "./client.js";
import { DrizzleAdminRepository } from "./repositories/DrizzleAdminRepository.js";
import { productsTable } from "./schema/index.js";

const logger = createLogger("seed");

async function seed() {
  const { db, close } = createDbClient({
    host: process.env.POSTGRES_HOST ?? "localhost",
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    database: process.env.POSTGRES_DB ?? "ecommerce",
    user: process.env.POSTGRES_USER ?? "postgres",
    password: process.env.POSTGRES_PASSWORD ?? "",
  });

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
  else logger.warn({ msg: adminResult.error.message }, "admin already exists, skipping");

  // ── Products — upsert so re-running seed is safe ──────────────────────────
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
        "A sculpted vessel printed in biodegradable PLA and finished by hand. Its faceted geometry catches light differently throughout the day, becoming a quiet centerpiece for any room.",
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
      name: "Studio Chess Set",
      slug: "studio-chess-set",
      tagline: "Modern silhouettes, tournament weight",
      category: "Games",
      material: "Resin — Matte",
      dimensions: "Board 36 × 36 cm",
      description:
        "A complete 32-piece set in matte white and ink. Weighted bases, precise tolerances, and a folding board printed in warm neutrals.",
      price: 142,
      stock: 6,
      whatsappNumber: "+5511999999999",
      imageUrl: null,
      images: [],
    },
    {
      id: "01900000-0000-7000-8000-000000000014",
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
    {
      id: "01900000-0000-7000-8000-000000000015",
      name: "Minute Wall Clock",
      slug: "minute-wall-clock",
      tagline: "Brushed face, silent movement",
      category: "Decor",
      material: "Composite — Graphite",
      dimensions: "Ø 30 cm",
      description:
        "A minimal wall clock with a brushed graphite finish and silent sweeping movement. Mounts flush to the wall with a single screw.",
      price: 96,
      stock: 12,
      whatsappNumber: "+5511999999999",
      imageUrl: null,
      images: [],
    },
    {
      id: "01900000-0000-7000-8000-000000000016",
      name: "Duet Bookends",
      slug: "duet-bookends",
      tagline: "A pair, in conversation",
      category: "Office",
      material: "Resin — Matte",
      dimensions: "20 × 14 × 12 cm (each)",
      description:
        "Two sculptural counterweights — one cream, one ink — designed to hold a row of books or simply stand on their own.",
      price: 78,
      stock: 18,
      whatsappNumber: "+5511999999999",
      imageUrl: null,
      images: [],
    },
    {
      id: "01900000-0000-7000-8000-000000000017",
      name: "Honeycomb Jewelry Stand",
      slug: "honeycomb-jewelry-stand",
      tagline: "Open lattice, soft shadow",
      category: "Office",
      material: "PLA — Bone White",
      dimensions: "16 × 14 × 14 cm",
      description:
        "A delicate hexagonal cage that holds earrings, rings, and small treasures while casting a beautiful patterned shadow.",
      price: 44,
      stock: 22,
      whatsappNumber: "+5511999999999",
      imageUrl: null,
      images: [],
    },
  ];

  for (const p of products) {
    const product = Product.create(p);
    // Upsert: update slug/tagline/category/etc. if product already exists
    try {
      await db
        .insert(productsTable)
        .values({
          id: product.id,
          name: product.name,
          slug: product.slug,
          tagline: product.tagline,
          category: product.category,
          material: product.material,
          dimensions: product.dimensions,
          description: product.description,
          price: product.price.value.toString(),
          stock: product.stock.toString(),
          whatsappNumber: product.whatsappNumber.value,
          imageUrl: product.imageUrl,
          images: product.images as string[],
          isActive: product.isActive,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        })
        .onConflictDoUpdate({
          target: productsTable.id,
          set: {
            name: product.name,
            slug: product.slug,
            tagline: product.tagline,
            category: product.category,
            material: product.material,
            dimensions: product.dimensions,
            description: product.description,
            price: product.price.value.toString(),
            stock: product.stock.toString(),
            whatsappNumber: product.whatsappNumber.value,
            updatedAt: new Date(),
          },
        });
      logger.info({ name: p.name }, "upserted product");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      logger.error({ error: msg, name: p.name }, "failed to upsert product");
    }
  }

  // Remove old placeholder products that have no slug
  await db.delete(productsTable).where(eq(productsTable.name, "Geometric Vase"));
  await db.delete(productsTable).where(eq(productsTable.name, "Desk Organizer"));

  await close();
  logger.info("seed complete");
}

seed().catch((e) => {
  logger.fatal({ error: e }, "seed script crashed");
  process.exit(1);
});
