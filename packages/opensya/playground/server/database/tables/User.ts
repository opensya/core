import { defineTable, string, uuid } from "../../../../src/server";

export default defineTable({
  columns: {
    id: uuid().primaryKey().required(),
    name: string().required(),
  },
});
