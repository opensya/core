import type { AnyColumnBuilder, DefineTable } from "./helper";

export function defineTable<TColumns extends Record<string, AnyColumnBuilder>>(
  table: DefineTable<TColumns>,
): DefineTable<TColumns> & { name: string } {
  return table as DefineTable<TColumns> & { name: string };
}

export type TableMeta = {
  name: string;
  tableName: string;
  typeName: string;
  file: string;
};
