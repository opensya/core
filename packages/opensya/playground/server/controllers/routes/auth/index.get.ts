import { db, defineRoute, tables } from "../../../../../src/server";

export default defineRoute(
  async (request) => {
    const [organisation] = await db.select().from(tables.organisation);

    return {
      user: request.user,
      organisation,
    };
  },

  { publicRoute: true },
);
