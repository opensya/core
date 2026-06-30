import { defineRoute, tables, db, orm } from "@core/server";
import { _ } from "@opensya/utils";

export default defineRoute(
  async (request) => {
    const body = request.body as typeof tables.users.$inferInsert;

    _.unset(body, "password");
    _.unset(body, "email");

    await tables.users.validateRow(body);

    const [user] = await db
      .update(tables.users)
      .set(body)
      .where(orm.eq(tables.users.id, request.user.sub))
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
