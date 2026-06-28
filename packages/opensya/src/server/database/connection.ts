import { drizzle } from "drizzle-orm/node-postgres";
export * as orm from "drizzle-orm";

export let db: ReturnType<typeof drizzle>;

export async function disconnectDatabase() {
  await db?.$client.end();
}

export function connectDatabase() {
  db = drizzle({
    connection: {
      connectionString: process.env.DATABASE_URL!,
      // ssl: true,
    },
  });
}
