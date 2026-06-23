import { defineService, tables, db } from "../../../src/server";

export default defineService(async () => {
  const [config] = await db.select().from(tables.config);

  config.name = "nw name";

  return config;
});
