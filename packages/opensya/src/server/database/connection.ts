import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export let db: ReturnType<typeof drizzle>;

export let pool: Pool;

export async function connectDatabase() {
  if (db) return db;

  pool = new Pool({ connectionString: process.env.DATABASE_URL });

  db = drizzle(pool);

  return db;
}

export async function disconnectDatabase() {
  await pool?.end();
}
