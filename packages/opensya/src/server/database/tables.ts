export interface Tables {}

export type TableName = keyof Tables;

export type Table<TKey extends TableName> = Tables[TKey];

export const tables = {} as Tables;

export function getTable<TKey extends TableName>(name: TKey): Table<TKey> {
  return tables[name];
}
