import { defineRoute, tables, db, orm } from "@core/server";
import { _ } from "@opensya/utils";

export default defineRoute(
  async (request) => {
    const body = request.body as typeof tables.user.$inferInsert;

    _.unset(body, "password");
    _.unset(body, "email");

    await tables.user.validateRow(body);

    const [user] = await db
      .update(tables.user)
      .set(body)
      .where(orm.eq(tables.user.id, request.user.sub))
      .returning();

    return user;
  },

  {
    schema: {
      body: {
        type: "object",
      },
    },
  },
);
