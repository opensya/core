import { defineTable } from "@opensya/persistence";
import { hash } from "argon2";

export default defineTable({
  name: "auths",
  collectionName: "auths",
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
      unique: false,
      validators: [],
    },

    {
      name: "tokenHash",
      columnName: "token_hash",
      type: "string",
      nullable: false,
      primaryKey: false,
      unique: false,
      validators: [],
      transform(value) {
        return hash(value as string);
      },
    },

    {
      name: "expiresAt",
      columnName: "expires_at",
      type: "timestamp",
      nullable: false,
      primaryKey: false,
      unique: false,
      validators: [],

      default: () => {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date;
      },
    },

    {
      name: "revokedAt",
      columnName: "revoke_at",
      type: "timestamp",
      nullable: true,
      primaryKey: false,
      unique: false,
      validators: [],
    },

    {
      name: "createdAt",
      columnName: "created_at",
      type: "timestamp",
      nullable: false,
      primaryKey: false,
      unique: false,
      default: () => new Date(),
      validators: [],
    },

    {
      name: "version",
      columnName: "version",
      type: "integer",
      nullable: false,
      primaryKey: false,
      unique: false,
      default: 1,
      validators: [],
    },
  ],

  relations: [
    {
      name: "user",
      kind: "manyToOne",
      target: "users",
      foreignKey: "userId",
    },
  ],

  tableValidators: [],

  audit: {
    enabled: true,
    excludedFields: [],
  },

  optimisticLock: {
    field: "version",
    initialVersion: 1,
  },

  indexes: [
    {
      name: "auths_user_created_idx",
      fields: ["userId", "createdAt"],
      unique: false,
    },
  ],
});
