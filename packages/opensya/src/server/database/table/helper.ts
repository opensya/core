import {
  boolean as pgBoolean,
  integer,
  jsonb,
  text,
  timestamp as pgTimestamp,
  uuid as pgUuid,
  pgTable,
} from "drizzle-orm/pg-core";

import type { PgColumnBuilderBase } from "drizzle-orm/pg-core";

export type AnyDrizzleColumnBuilder = PgColumnBuilderBase;

export type HiddenDrizzleMethods = "primaryKey" | "notNull";

export type EnhancedColumn<T> = EnhanceDrizzleMethods<T> & {
  primary(): T extends { primaryKey(): infer R }
    ? EnhancedColumn<R>
    : EnhancedColumn<T>;

  require(): T extends { notNull(): infer R }
    ? EnhancedColumn<R>
    : EnhancedColumn<T>;
};

export type EnhanceMethod<TFn> = TFn extends (...args: infer Args) => infer R
  ? R extends AnyDrizzleColumnBuilder
    ? (...args: Args) => EnhancedColumn<R>
    : TFn
  : TFn;

export type EnhanceDrizzleMethods<T> = {
  [K in keyof Omit<T, HiddenDrizzleMethods>]: EnhanceMethod<
    Omit<T, HiddenDrizzleMethods>[K]
  >;
};

export function buildColumn<TDrizzle extends AnyDrizzleColumnBuilder>(
  column: TDrizzle,
): EnhancedColumn<TDrizzle> {
  const wrapped = Object.assign(column, {
    primary() {
      return buildColumn((column as any).primaryKey());
    },

    require() {
      return buildColumn((column as any).notNull());
    },
  });

  return wrapped as unknown as EnhancedColumn<TDrizzle>;
}

export const uuid = () => buildColumn(pgUuid());
export const int = () => buildColumn(integer());
export const json = <T = unknown>() => buildColumn(jsonb().$type<T>());
export const string = () => buildColumn(text());
export const timestamp = () => buildColumn(pgTimestamp());
export const boolean = () => buildColumn(pgBoolean());

export type AnyEnhancedColumn = EnhancedColumn<AnyDrizzleColumnBuilder>;

export type TableMeta = {
  name: string;
  tableName: string;
  typeName: string;
  columns: Record<string, { file: string }>;
};

export function createDrizzleTable<
  TName extends string,
  TColumns extends Record<string, AnyEnhancedColumn>,
>(name: TName, columns: TColumns) {
  return pgTable(name, columns);
}
