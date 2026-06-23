import { defineTable, string, uuid } from "../../../../src/server";

export default defineTable({
  columns: {
    id: uuid().defaultRandom().primaryKey().required(),

    firstName: string().required(),
    lastName: string().required(),

    email: string().required(),
    password: string(),
  },
});
