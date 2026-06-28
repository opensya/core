import { db, defineRoute, tables } from "@core/server";

export default defineRoute(
  async () => {
    const [organisation] = await db.select().from(tables.organisation);
    return organisation;
  },

  { publicRoute: true },
);
