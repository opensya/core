import { defineService, orm, NotFoundError } from "../../../src/server";
import { _ } from "@opensya/utils";

export default defineService(
  async (userId: string, data: Partial<typeof tables.users.$inferSelect>) => {
    let [user] = await db
      .select()
      .from(tables.users)
      .where(orm.eq(tables.users.id, userId));

    if (!user) throw new NotFoundError("User not found");

    _.unset(data, "password");
    _.unset(data, "email");

    await tables.users.validateRow(data);

    [user] = await db
      .update(tables.users)
      .set(data)
      .where(orm.eq(tables.users.id, userId))
      .returning();

    return user;
  },
);
