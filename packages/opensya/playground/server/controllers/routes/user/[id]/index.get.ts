import { db, defineRoute, NotFoundError, orm, tables } from "@core/server";
import { _ } from "@opensya/utils";

export default defineRoute(
  async (request) => {
    const [user] = await db
      .select()
      .from(tables.user)
      .where(orm.eq(tables.user.id, request.user.sub));

    if (!user) throw new NotFoundError("User not found");

    _.unset(user, "password");

    return user;
  },

  { publicRoute: true },
);
