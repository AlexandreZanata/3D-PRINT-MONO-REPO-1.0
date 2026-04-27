// @max-lines 200 — this is enforced by the lint pipeline.
import type { IProductRepository, PaginatedResult, PaginationOptions, ProductFilters } from "@repo/domain";
import type { Product } from "@repo/domain";
import { InfraError } from "@repo/utils";
import { type Result, err, ok } from "@repo/utils";
import { and, count, eq, gte, ilike, isNull, lte } from "drizzle-orm";
import type { DbClient } from "../client.js";
import { productsTable } from "../schema";
import { toProductEntity } from "./mappers.js";

export class DrizzleProductRepository implements IProductRepository {
  constructor(private readonly db: DbClient) {}

  async findById(id: string): Promise<Result<Product | null, InfraError>> {
    try {
      const rows = await this.db
        .select()
        .from(productsTable)
        .where(and(eq(productsTable.id, id), isNull(productsTable.deletedAt)))
        .limit(1);
      const row = rows[0];
      return ok(row ? toProductEntity(row) : null);
    } catch (e) {
      return err(new InfraError("findById failed", toError(e), "DB_ERROR"));
    }
  }

  async findAll(
    filters: ProductFilters,
    pagination: PaginationOptions,
  ): Promise<Result<PaginatedResult<Product>, InfraError>> {
    try {
      const conditions = buildConditions(filters);
      const offset = (pagination.page - 1) * pagination.limit;

      const [rows, [countRow]] = await Promise.all([
        this.db
          .select()
          .from(productsTable)
          .where(and(...conditions))
          .limit(pagination.limit)
          .offset(offset),
        this.db.select({ total: count() }).from(productsTable).where(and(...conditions)),
      ]);

      return ok({
        items: rows.map(toProductEntity),
        total: Number(countRow?.total ?? 0),
        page: pagination.page,
        limit: pagination.limit,
      });
    } catch (e) {
      return err(new InfraError("findAll failed", toError(e), "DB_ERROR"));
    }
  }

  async save(product: Product): Promise<Result<void, InfraError>> {
    try {
      await this.db.insert(productsTable).values({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price.value.toString(),
        stock: product.stock.toString(),
        whatsapp_number: product.whatsappNumber.value,
        image_url: product.imageUrl,
        is_active: product.isActive,
        created_at: product.createdAt,
        updated_at: product.updatedAt,
      });
      return ok(undefined);
    } catch (e) {
      return err(new InfraError("save failed", toError(e), "DB_ERROR"));
    }
  }

  async update(product: Product): Promise<Result<void, InfraError>> {
    try {
      await this.db
        .update(productsTable)
        .set({
          name: product.name,
          description: product.description,
          price: product.price.value.toString(),
          stock: product.stock.toString(),
          whatsapp_number: product.whatsappNumber.value,
          image_url: product.imageUrl,
          is_active: product.isActive,
          updated_at: new Date(),
        })
        .where(eq(productsTable.id, product.id));
      return ok(undefined);
    } catch (e) {
      return err(new InfraError("update failed", toError(e), "DB_ERROR"));
    }
  }

  async softDelete(id: string): Promise<Result<void, InfraError>> {
    try {
      await this.db
        .update(productsTable)
        .set({ deleted_at: new Date(), is_active: false, updated_at: new Date() })
        .where(eq(productsTable.id, id));
      return ok(undefined);
    } catch (e) {
      return err(new InfraError("softDelete failed", toError(e), "DB_ERROR"));
    }
  }
}

function buildConditions(filters: ProductFilters) {
  const conditions = [isNull(productsTable.deletedAt)];
  if (filters.name !== undefined) conditions.push(ilike(productsTable.name, `%${filters.name}%`));
  if (filters.minPrice !== undefined) conditions.push(gte(productsTable.price, filters.minPrice.toString()));
  if (filters.maxPrice !== undefined) conditions.push(lte(productsTable.price, filters.maxPrice.toString()));
  if (filters.isActive !== undefined) conditions.push(eq(productsTable.isActive, filters.isActive));
  return conditions;
}

function toError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e));
}
