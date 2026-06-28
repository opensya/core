import type { MayBePromise } from "@opensya/utils";
import {
  boolean as pgBoolean,
  integer,
  jsonb,
  text,
  timestamp as pgTimestamp,
  uuid as pgUuid,
  pgTable,
  pgEnum,
} from "drizzle-orm/pg-core";

import type { PgColumnBuilder, PgTimestampConfig } from "drizzle-orm/pg-core";
import { BadRequestError } from "../../error";
import type { ColumnBuilderBaseConfig } from "drizzle-orm";

export type AnyDrizzleColumnBuilder = PgColumnBuilder<any>;

export type HiddenDrizzleMethods = "primaryKey" | "notNull";

export type InferColumnValue<T> =
  T extends EnhancedColumn<infer TDrizzle>
    ? InferColumnValue<TDrizzle>
    : T extends PgColumnBuilder<infer TConfig>
      ? TConfig extends ColumnBuilderBaseConfig<any>
        ? TConfig["data"]
        : unknown
      : unknown;

export type ValidateFn<TColumn> = (
  value: InferColumnValue<TColumn>,
  data: any,
) => MayBePromise<string | null>;

export type RelationDef = {
  type: "one" | "many";
  to: `${string}.${string}`;

  alias?: string;

  optional?: boolean;

  inverse?: {
    alias: string;
  };
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

export type EnhancedColumn<T> = EnhanceDrizzleMethods<T> & {
  _validateFn?: ValidateFn<T>;
  _relation?: RelationDef;
  _enumValues?: { name: string; values: string[] };

  primary(): T extends { primaryKey(): infer R }
    ? EnhancedColumn<R>
    : EnhancedColumn<T>;

  require(): T extends { notNull(): infer R }
    ? EnhancedColumn<R>
    : EnhancedColumn<T>;

  validate(fn: ValidateFn<T>): EnhancedColumn<T>;

  relation(def: RelationDef): EnhancedColumn<T>;
};

export function buildColumn<TDrizzle extends AnyDrizzleColumnBuilder>(
  column: TDrizzle,
  validateFn?: ValidateFn<TDrizzle>,
  relationDef?: RelationDef,
): EnhancedColumn<TDrizzle> {
  const wrapped = Object.assign(column, {
    _validateFn: validateFn,
    _relation: relationDef,

    primary() {
      return buildColumn((column as any).primaryKey(), validateFn, relationDef);
    },

    require() {
      return buildColumn((column as any).notNull(), validateFn, relationDef);
    },

    validate(fn: ValidateFn<TDrizzle>) {
      return buildColumn(column, fn, relationDef);
    },

    relation(def: RelationDef) {
      return buildColumn(column, validateFn, def);
    },
  });

  return wrapped as unknown as EnhancedColumn<TDrizzle>;
}

export const uuid = () => buildColumn(pgUuid());

export const int = () => buildColumn(integer());

export const json = <T = unknown>() => buildColumn(jsonb().$type<T>());

export const string = () => buildColumn(text());

export const date = (config?: PgTimestampConfig) =>
  buildColumn(pgTimestamp(config));

export const boolean = () => buildColumn(pgBoolean());

export function enumeration<
  const TName extends string,
  const TValues extends readonly [string, ...string[]],
>(name: TName, values: TValues) {
  const enumBuilder = pgEnum(name, values);

  return Object.assign(buildColumn(enumBuilder().$type<TValues[number]>()), {
    _enumValues: { name, values },
  });
}

export type AnyEnhancedColumn = EnhancedColumn<AnyDrizzleColumnBuilder>;

export type TableMeta = {
  outputFile: string;
  name: string;
  tableName: string;
  typeName: string;
  columns: Record<
    string,
    {
      file: string;
      relation?: RelationDef;
      enumeration?: { name: string; values: string[] };
    }
  >;
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
