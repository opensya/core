import { defineRoute, orm } from "@core/server";
import { _ } from "@opensya/utils";

export default defineRoute(
  async (request) => {
    const [organisation] = await db.select().from(tables.organisation);

    if (!request.user) return { organisation };

    const [user] = await db
      .select()
      .from(tables.users)
      .where(orm.eq(tables.users.id, request.user.sub));

    _.unset(user, "password");
    _.assign(user, { sub: user.id });

    console.log();

    return {
      user,
      organisation,

      orgRole: request.actor?.orgRole,
      teamRoles: request.actor?.teamRoles,
    };
  },

  { publicRoute: true },
);
