// @max-lines 200 — this is enforced by the lint pipeline.
import type { IRefreshTokenRepository, RefreshTokenRecord } from "@repo/domain";
import { InfraError } from "@repo/utils";
import { type Result, err, ok } from "@repo/utils";
import { eq } from "drizzle-orm";
import type { DbClient } from "../client.js";
import { refreshTokensTable } from "../schema/index.js";

export class DrizzleRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly db: DbClient) {}

  async findByTokenHash(hash: string): Promise<Result<RefreshTokenRecord | null, InfraError>> {
    try {
      const rows = await this.db
        .select()
        .from(refreshTokensTable)
        .where(eq(refreshTokensTable.tokenHash, hash))
        .limit(1);
      const row = rows[0];
      return ok(row ? toRecord(row) : null);
    } catch (e) {
      return err(new InfraError("findByTokenHash failed", toError(e), "DB_ERROR"));
    }
  }

  async findByFamilyId(familyId: string): Promise<Result<RefreshTokenRecord[], InfraError>> {
    try {
      const rows = await this.db
        .select()
        .from(refreshTokensTable)
        .where(eq(refreshTokensTable.familyId, familyId));
      return ok(rows.map(toRecord));
    } catch (e) {
      return err(new InfraError("findByFamilyId failed", toError(e), "DB_ERROR"));
    }
  }

  async save(record: RefreshTokenRecord): Promise<Result<void, InfraError>> {
    try {
      await this.db.insert(refreshTokensTable).values({
        id: record.id,
        adminId: record.adminId,
        tokenHash: record.tokenHash,
        familyId: record.familyId,
        expiresAt: record.expiresAt,
        revokedAt: record.revokedAt,
      });
      return ok(undefined);
    } catch (e) {
      return err(new InfraError("save failed", toError(e), "DB_ERROR"));
    }
  }

  async revoke(id: string, at: Date): Promise<Result<void, InfraError>> {
    try {
      await this.db
        .update(refreshTokensTable)
        .set({ revokedAt: at })
        .where(eq(refreshTokensTable.id, id));
      return ok(undefined);
    } catch (e) {
      return err(new InfraError("revoke failed", toError(e), "DB_ERROR"));
    }
  }

  async revokeFamily(familyId: string, at: Date): Promise<Result<void, InfraError>> {
    try {
      await this.db
        .update(refreshTokensTable)
        .set({ revokedAt: at })
        .where(eq(refreshTokensTable.familyId, familyId));
      return ok(undefined);
    } catch (e) {
      return err(new InfraError("revokeFamily failed", toError(e), "DB_ERROR"));
    }
  }
}

function toRecord(row: typeof refreshTokensTable.$inferSelect): RefreshTokenRecord {
  return {
    id: row.id,
    adminId: row.adminId,
    tokenHash: row.tokenHash,
    familyId: row.familyId,
    expiresAt: row.expiresAt,
    revokedAt: row.revokedAt ?? null,
  };
}

function toError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e));
}
