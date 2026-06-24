import { defineTable, string, uuid } from "../../../../src/server";

export default defineTable({
  columns: {
    id: uuid().defaultRandom().primary().require(),

    firstName: string().require(),
    lastName: string().require(),

    email: string().require(),
    password: string(),
  },
});
