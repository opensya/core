import { date, uuid } from "@core/server";

export const id = uuid().defaultRandom().primary().require();

export const userId = uuid()
  .require()
  .relation({
    type: "one",
    to: "users.id",
    alias: "user",
    onDelete: "cascade",
    inverse: {
      alias: "membership",
    },
  })
  .index({
    name: "memberships_user_unique_idx",
    unique: true,
  });

export const roleId = uuid()
  .require()
  .relation({
    type: "one",
    to: "roles.id",
    alias: "role",
    inverse: {
      alias: "memberships",
    },
  });

export const joinedAt = date({ withTimezone: true }).require().defaultNow();
