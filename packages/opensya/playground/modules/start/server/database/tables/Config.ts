import { defineTable, json, string, uuid } from "../../../../../../src/server";

export default defineTable({
  columns: {
    id: uuid().primaryKey(),
    name: string().required(),
    logo: json<Record<string, unknown>>(),
    favicon: json<Record<string, unknown>>(),
    primaryColor: string(),
    colorMode: string(),
  },
});
