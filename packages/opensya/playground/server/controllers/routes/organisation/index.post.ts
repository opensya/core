import { db, defineRoute, tables } from "../../../../../src/server";

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

        // required: ["email", "password"],

        // properties: {
        //   email: { type: "string", format: "email" },
        //   password: { type: "string", minLength: 6 },
        // },
      },
    },
  },
);
