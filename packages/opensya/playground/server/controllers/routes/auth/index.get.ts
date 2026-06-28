import { db, defineRoute, orm, tables } from "@core/server";
import { _ } from "@opensya/utils";

export default defineRoute(
  async (request) => {
    const [user] = await db
      .select()
      .from(tables.user)
      .where(orm.eq(tables.user.id, request.user.sub));

    const [organisation] = await db.select().from(tables.organisation);

    if (user) {
      _.unset(user, "password");
      _.assign(user, { sub: user.id });
    }

    return {
      user,
      organisation,
    };
  },

  { publicRoute: true },
);
