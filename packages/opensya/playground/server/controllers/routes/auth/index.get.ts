import { db, defineRoute, orm, tables } from "@core/server";
import { _ } from "@opensya/utils";

export default defineRoute(
  async (request) => {
    const [organisation] = await db.select().from(tables.organisation);

    if (!request.user) return { organisation };

    const [user] = await db
      .select()
      .from(tables.users)
      .where(orm.eq(tables.users.id, request.user.sub));

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
