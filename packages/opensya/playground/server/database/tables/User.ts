import { defineTable, string, uuid } from "opensya/server";

export default defineTable({
  columns: {
    id: uuid().primaryKey().required(),
    name: string().required(),
  },
});
