import { db, defineRoute, tables } from "@core/server";

export default defineRoute(
  async (request) => {
    const body = request.body as typeof tables.organisation.$inferInsert;

    await tables.organisation.validateRow(body);

    const [organisation] = await db
      .update(tables.organisation)
      .set(body)
      .returning();

    return organisation;
  },

  {
    schema: {
      body: {
        type: "object",
      },
    },
  },
);
