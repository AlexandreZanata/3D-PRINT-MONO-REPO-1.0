// @max-lines 200 — this is enforced by the lint pipeline.
import { Admin } from "@repo/domain";
import { Product } from "@repo/domain";
import { EmailVO } from "@repo/domain";
import { PriceVO } from "@repo/domain";
import { WhatsAppNumberVO } from "@repo/domain";
import type { AdminSelectModel, ProductSelectModel } from "../schema";

/** Maps a Drizzle product row to the Product domain entity. */
export function toProductEntity(row: ProductSelectModel): Product {
  return Product.reconstitute({
    id: row.id,
    name: row.name,
    description: row.description,
    // numeric columns come back as strings from postgres driver
    price: PriceVO.create(Number(row.price)),
    stock: Number(row.stock),
    whatsappNumber: WhatsAppNumberVO.create(row.whatsappNumber),
    imageUrl: row.imageUrl ?? null,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt ?? null,
  });
}

/** Maps a Drizzle admin row to the Admin domain entity. */
export function toAdminEntity(row: AdminSelectModel): Admin {
  return Admin.reconstitute({
    id: row.id,
    email: EmailVO.create(row.email),
    passwordHash: row.passwordHash,
    role: row.role,
    createdAt: row.createdAt,
    lastLoginAt: row.lastLoginAt ?? null,
  });
}
