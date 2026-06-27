import type { MayBePromise } from "@opensya/utils";
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
import { BadRequestError } from "../../error";

export type AnyDrizzleColumnBuilder = PgColumnBuilderBase;

export type HiddenDrizzleMethods = "primaryKey" | "notNull";

// Infère le type de valeur d'une colonne Drizzle
export type InferColumnValue<T> = T extends { _: { data: infer D } }
  ? D
  : unknown;

export type ValidateFn<TColumn, TData = unknown> = (
  value: InferColumnValue<TColumn>,
  data: TData,
) => MayBePromise<string | null>;

export type EnhancedColumn<T, TData = unknown> = EnhanceDrizzleMethods<T> & {
  _validateFn?: ValidateFn<T, TData>;

  primary(): T extends { primaryKey(): infer R }
    ? EnhancedColumn<R, TData>
    : EnhancedColumn<T, TData>;

  require(): T extends { notNull(): infer R }
    ? EnhancedColumn<R, TData>
    : EnhancedColumn<T, TData>;

  validate(fn: ValidateFn<T, TData>): EnhancedColumn<T, TData>;
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

export function buildColumn<
  TDrizzle extends AnyDrizzleColumnBuilder,
  TData = unknown,
>(
  column: TDrizzle,
  validateFn?: ValidateFn<TDrizzle, TData>,
): EnhancedColumn<TDrizzle, TData> {
  const wrapped = Object.assign(column, {
    _validateFn: validateFn,

    primary() {
      return buildColumn((column as any).primaryKey(), validateFn);
    },

    require() {
      return buildColumn((column as any).notNull(), validateFn);
    },

    validate(fn: ValidateFn<TDrizzle, TData>) {
      return buildColumn(column, fn);
    },
  });

  return wrapped as unknown as EnhancedColumn<TDrizzle, TData>;
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

export type InferTableInput<
  TColumns extends Record<string, AnyEnhancedColumn>,
> = {
  [K in keyof TColumns]: InferColumnValue<TColumns[K]>;
};

export function createDrizzleTable<
  TName extends string,
  TColumns extends Record<string, AnyEnhancedColumn>,
>(name: TName, columns: TColumns) {
  const table = pgTable(name, columns);

  async function validateRow(data: Record<string, any>) {
    for (const [field, col] of Object.entries(columns)) {
      const fn = (col as AnyEnhancedColumn)._validateFn;
      if (!fn) continue;

      const value = (data as Record<string, unknown>)[field];
      const error = await fn(value as any, data);

      if (error !== null) {
        throw new BadRequestError(error);
      }
    }
  }

  return Object.assign(table, { validateRow });
}
