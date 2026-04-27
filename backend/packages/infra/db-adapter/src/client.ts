// @max-lines 200 — this is enforced by the lint pipeline.
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index.js";

export type DbClient = PostgresJsDatabase<typeof schema>;

export interface DbConfig {
  readonly host: string;
  readonly port: number;
  readonly database: string;
  readonly user: string;
  readonly password: string;
  readonly ssl?: boolean;
}

/**
 * Creates a Drizzle client connected to PostgreSQL.
 * The caller is responsible for closing the underlying connection pool.
 */
export function createDbClient(config: DbConfig): { db: DbClient; close: () => Promise<void> } {
  const sql = postgres({
    host: config.host,
    port: config.port,
    database: config.database,
    username: config.user,
    password: config.password,
    ssl: config.ssl ?? false,
    max: 10,
  });

  const db = drizzle(sql, { schema });

  return {
    db,
    close: async () => {
      await sql.end();
    },
  };
}
