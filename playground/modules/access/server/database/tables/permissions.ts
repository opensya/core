import { defineTable } from "@opensya/persistence";

export default defineTable({
  name: "permissions",
  collectionName: "permissions",
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
      name: "resource",
      columnName: "resource",
      type: "string",
      nullable: false,
      primaryKey: false,
      unique: false,
      validators: [],
    },
    {
      name: "action",
      columnName: "action",
      type: "string",
      nullable: false,
      primaryKey: false,
      unique: false,
      validators: [],
    },
    {
      name: "slug",
      columnName: "slug",
      type: "string",
      nullable: false,
      primaryKey: false,
      unique: true,
      validators: [],
    },
  ],
  relations: [
    {
      name: "roles",
      kind: "manyToMany",
      target: "roles",
      through: {
        table: "role_permissions",
        sourceForeignKey: "permissionId",
        targetForeignKey: "roleId",
      },
      sourceKey: "id",
      targetKey: "id",
    },
  ],
  tableValidators: [],
  indexes: [
    {
      name: "permissions_resource_action_idx",
      fields: ["resource", "action"],
      unique: true,
    },
  ],
});
