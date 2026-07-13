import { defineTable } from "@opensya/persistence";

export default defineTable({
  name: "users",
  collectionName: "users",
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
      name: "email",
      columnName: "email",
      type: "string",
      nullable: false,
      primaryKey: false,
      unique: true,
      validators: [
        {
          name: "email-format",
          validate(value) {
            return typeof value === "string" && value.includes("@")
              ? { valid: true }
              : { valid: false, message: "Enter a valid email address." };
          },
        },
      ],
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
      name: "password",
      columnName: "password_hash",
      type: "string",
      nullable: true,
      primaryKey: false,
      unique: false,
      hidden: true,
      validators: [
        {
          name: "password-length",
          validate(value) {
            return typeof value === "string" && value.length >= 12
              ? { valid: true }
              : { valid: false, message: "Use at least 12 characters." };
          },
        },
      ],
      // transform(value) {
      //   return hash(value as string)
      // }
    },
  ],
  relations: [],
  tableValidators: [],

  audit: {
    enabled: true,
    excludedFields: [],
  },
});
