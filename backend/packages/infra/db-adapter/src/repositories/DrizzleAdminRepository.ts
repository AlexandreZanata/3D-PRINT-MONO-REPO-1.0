// @max-lines 200 — this is enforced by the lint pipeline.
import type { Admin, IAdminRepository } from "@repo/domain";
import { InfraError } from "@repo/utils";
import { type Result, err, ok } from "@repo/utils";
import { eq } from "drizzle-orm";
import type { DbClient } from "../client.js";
import { adminsTable } from "../schema";
import { toAdminEntity } from "./mappers.js";

export class DrizzleAdminRepository implements IAdminRepository {
  constructor(private readonly db: DbClient) {}

  async findById(id: string): Promise<Result<Admin | null, InfraError>> {
    try {
      const rows = await this.db.select().from(adminsTable).where(eq(adminsTable.id, id)).limit(1);
      const row = rows[0];
      return ok(row ? toAdminEntity(row) : null);
    } catch (e) {
      return err(new InfraError("findById failed", toError(e), "DB_ERROR"));
    }
  }

  async findByEmail(email: string): Promise<Result<Admin | null, InfraError>> {
    try {
      const rows = await this.db
        .select()
        .from(adminsTable)
        .where(eq(adminsTable.email, email.toLowerCase()))
        .limit(1);
      const row = rows[0];
      return ok(row ? toAdminEntity(row) : null);
    } catch (e) {
      return err(new InfraError("findByEmail failed", toError(e), "DB_ERROR"));
    }
  }

  async save(admin: Admin): Promise<Result<void, InfraError>> {
    try {
      await this.db.insert(adminsTable).values({
        id: admin.id,
        email: admin.email.value,
        password_hash: admin.passwordHash,
        role: admin.role,
        created_at: admin.createdAt,
        last_login_at: admin.lastLoginAt,
      });
      return ok(undefined);
    } catch (e) {
      return err(new InfraError("save failed", toError(e), "DB_ERROR"));
    }
  }

  async updateLastLogin(id: string, at: Date): Promise<Result<void, InfraError>> {
    try {
      await this.db.update(adminsTable).set({ last_login_at: at }).where(eq(adminsTable.id, id));
      return ok(undefined);
    } catch (e) {
      return err(new InfraError("updateLastLogin failed", toError(e), "DB_ERROR"));
    }
  }
}

function toError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e));
}
