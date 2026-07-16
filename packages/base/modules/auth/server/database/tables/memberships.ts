import { defineTable } from "@opensya/persistence";

export default defineTable({
  name: "memberships",
  collectionName: "memberships",
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
      name: "userId",
      columnName: "user_id",
      type: "uuid",
      nullable: false,
      primaryKey: false,
      unique: true,
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
      name: "joinedAt",
      columnName: "joined_at",
      type: "timestamp",
      nullable: false,
      primaryKey: false,
      unique: false,
      default: () => new Date(),
      validators: [],
    },
  ],
  relations: [
    {
      name: "user",
      kind: "manyToOne",
      target: "users",
      foreignKey: "userId",
      references: "id",
    },
    {
      name: "role",
      kind: "manyToOne",
      target: "roles",
      foreignKey: "roleId",
      references: "id",
    },
  ],
  tableValidators: [],
});
