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
      alias: "teamMemberships",
    },
  })
  .index((table, { uniqueIndex }) => [
    uniqueIndex("team_memberships_user_team_idx").on(
      table.userId,
      table.teamId,
    ),
  ]);

export const teamId = uuid()
  .require()
  .relation({
    type: "one",
    to: "teams.id",
    alias: "team",
    onDelete: "cascade",
    inverse: {
      alias: "memberships",
    },
  });

export const roleId = uuid().relation({
  type: "one",
  to: "roles.id",
  alias: "role",
  optional: true,
  onDelete: "set null",
  inverse: {
    alias: "teamMemberships",
  },
});

export const joinedAt = date({ withTimezone: true }).require().defaultNow();
