import { defineTable } from "@opensya/persistence";

export default defineTable({
  name: "role_permissions",
  collectionName: "role_permissions",
  columns: [
    {
      name: "id",
      columnName: "id",
      type: "uuid",
      nullable: false,
      primaryKey: true,
      unique: true,
      default: () => crypto.randomUUID(),
      validators: [],
    },
    {
      name: "roleId",
      columnName: "role_id",
      type: "uuid",
      nullable: false,
      primaryKey: false,
      unique: false,
      validators: [],
    },
    {
      name: "permissionId",
      columnName: "permission_id",
      type: "uuid",
      nullable: false,
      primaryKey: false,
      unique: false,
      validators: [],
    },
  ],
  relations: [
    {
      name: "role",
      kind: "manyToOne",
      target: "roles",
      foreignKey: "roleId",
      references: "id",
    },
    {
      name: "permission",
      kind: "manyToOne",
      target: "permissions",
      foreignKey: "permissionId",
      references: "id",
    },
  ],
  tableValidators: [],
  indexes: [
    {
      name: "role_permissions_role_permission_idx",
      fields: ["roleId", "permissionId"],
      unique: true,
    },
  ],
});
