import type { MayBePromise } from "@opensya/utils";
import {
  boolean as pgBoolean,
  integer,
  jsonb,
  text as pgText,
  varchar,
  timestamp as pgTimestamp,
  uuid as pgUuid,
  pgTable,
  pgEnum,
  index as pgIndex,
  uniqueIndex as pgUniqueIndex,
  primaryKey as pgPrimaryKey,
} from "drizzle-orm/pg-core";

import type {
  IndexBuilder,
  PgColumnBuilder,
  PgTimestampConfig,
  PgVarcharConfig,
  PrimaryKeyBuilder,
} from "drizzle-orm/pg-core";
import { BadRequestError } from "../../error";

export type AnyDrizzleColumnBuilder = PgColumnBuilder<any>;
export type HiddenDrizzleMethods = "primaryKey" | "notNull" | "references";

export type ValidateFn = (value: any, data: any) => MayBePromise<string | null>;

export type ReferenceAction =
  | "cascade"
  | "restrict"
  | "no action"
  | "set null"
  | "set default";

export type RelationDef = {
  type: "one" | "many";
  to: `${string}.${string}`; // table.field

  alias?: string;

  optional?: boolean;

  onDelete?: ReferenceAction;

  onUpdate?: ReferenceAction;

  inverse?: {
    alias: string;
  };
};

export type IndexDef = {
  name?: string;
  unique?: boolean;
};
export type IndexHelpers = {
  index: typeof pgIndex;
  uniqueIndex: typeof pgUniqueIndex;
  primaryKey: typeof pgPrimaryKey;
};
export type IndexFactory = (
  table: any,
  helpers: IndexHelpers,
) => Array<IndexBuilder | PrimaryKeyBuilder>;

export type ColumnIndexDef = IndexDef | IndexFactory;

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

type ColumnMeta = {
  validateFn?: ValidateFn;
  relationDef?: RelationDef;
  enumValues?: { name: string; values: readonly string[] };
  indexes?: ColumnIndexDef[];
};

export type EnhancedColumn<T> = EnhanceDrizzleMethods<T> & {
  _validateFn?: ValidateFn;
  _relation?: RelationDef;
  _enumValues?: { name: string; values: readonly string[] };
  _indexes?: ColumnIndexDef[];

  primary(): T extends { primaryKey(): infer R }
    ? EnhancedColumn<R>
    : EnhancedColumn<T>;

  require(): T extends { notNull(): infer R }
    ? EnhancedColumn<R>
    : EnhancedColumn<T>;

  validate(fn: ValidateFn): EnhancedColumn<T>;

  relation(def: RelationDef): EnhancedColumn<T>;

  index(def?: ColumnIndexDef): EnhancedColumn<T>;
};

export function buildColumn<TDrizzle extends AnyDrizzleColumnBuilder>(
  column: TDrizzle,
  meta: ColumnMeta = {},
): EnhancedColumn<TDrizzle> {
  const wrapped = Object.assign(column, {
    _validateFn: meta.validateFn,
    _relation: meta.relationDef,
    _enumValues: meta.enumValues,
    _indexes: meta.indexes,

    primary() {
      return buildColumn((column as any).primaryKey(), meta);
    },

    require() {
      return buildColumn((column as any).notNull(), meta);
    },

    validate(fn: ValidateFn) {
      return buildColumn(column, {
        ...meta,
        validateFn: fn,
      });
    },

    relation(def: RelationDef) {
      return buildColumn(column, {
        ...meta,
        relationDef: def,
      });
    },

    index(def: ColumnIndexDef = {}) {
      return buildColumn(column, {
        ...meta,
        indexes: [...(meta.indexes ?? []), def],
      });
    },
  });

  return wrapped as unknown as EnhancedColumn<TDrizzle>;
}

export const uuid = () => buildColumn(pgUuid());

export const int = () => buildColumn(integer());

export const json = <T = unknown>() => buildColumn(jsonb().$type<T>());

export const string = (config: PgVarcharConfig = {}) =>
  buildColumn(varchar(config));

export const text = () => buildColumn(pgText());

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
      enumeration?: { name: string; values: readonly string[] };
    }
  >;
};

export function createDrizzleTable<
  TName extends string,
  TColumns extends Record<string, AnyEnhancedColumn>,
>(name: TName, columns: TColumns) {
  const table = pgTable(name, columns, (t) => {
    const indexes: Array<IndexBuilder | PrimaryKeyBuilder> = [];
    for (const [field, col] of Object.entries(columns)) {
      const _indexes = (col as AnyEnhancedColumn)._indexes ?? [];

      for (const indexDef of _indexes) {
        if (typeof indexDef === "function") {
          indexes.push(
            ...indexDef(t, {
              index: pgIndex,
              uniqueIndex: pgUniqueIndex,
              primaryKey: pgPrimaryKey,
            }),
          );

          continue;
        }

        const indexName =
          indexDef.name ??
          `${name}_${field}_${indexDef.unique ? "unique_idx" : "idx"}`;

        indexes.push(
          indexDef.unique
            ? pgUniqueIndex(indexName).on((t as any)[field])
            : pgIndex(indexName).on((t as any)[field]),
        );
      }
    }

    return indexes;
  });

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
