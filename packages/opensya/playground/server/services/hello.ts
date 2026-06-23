import { defineService, tables, db } from "../../../src/server";

export default defineService(async () => {
  const [config] = await db.select().from(tables.config);

  return { hey: true };
});
