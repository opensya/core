import { uuid } from "@core/server";

export const roleId = uuid()
  .require()
  .relation({
    type: "one",
    to: "roles.id",
    alias: "role",
    onDelete: "cascade",
    inverse: {
      alias: "permissions",
    },
  });

export const permissionId = uuid()
  .require()
  .relation({
    type: "one",
    to: "permissions.id",
    alias: "permission",
    onDelete: "cascade",
    inverse: {
      alias: "roles",
    },
  })
  .index((table, { primaryKey }) => [
    primaryKey({ columns: [table.roleId, table.permissionId] }),
  ]);
