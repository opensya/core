import { defineTable, string, uuid } from "#server/database";

export default defineTable({
  columns: {
    id: uuid().primaryKey().required(),
    name: string().required(),
  },
});

// import {
//   defineTable,
//   string,
//   json,
//   InferTable,
// } from './table.helper';

// const table = defineTable({
//   name: 'apps',

//   columns: {
//     id: uuid().primaryKey(),
//     name: string().required(),
//     logo: json<Record<string, unknown>>(),
//     favicon: json<Record<string, unknown>>(),
//     primaryColor: string(),
//     colorMode: string(),
//   },
// });

// export const apps = createDrizzleTable(table);

// export type App = InferTable<typeof table.columns>;

// type App = {
//   name: string;
//   logo: Record<string, unknown> | null;
//   favicon: Record<string, unknown> | null;
//   primaryColor: string | null;
//   colorMode: string | null;
// };
