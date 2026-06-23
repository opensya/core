/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  boolean as pgBoolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp as pgTimestamp,
  uuid as pgUuid,
} from "drizzle-orm/pg-core";

export type ColumnType =
  | "string"
  | "number"
  | "boolean"
  | "json"
  | "timestamp"
  | "uuid";

export interface ColumnDefinition<
  TType extends ColumnType = ColumnType,
  TValue = unknown,
  TRequired extends boolean = false,
> {
  type: TType;
  required?: TRequired;
  unique?: boolean;
  primaryKey?: boolean;
  default?: TValue;
  defaultNow?: boolean;
  defaultRandom?: boolean;
}

export type AnyDrizzleColumnBuilder =
  | ReturnType<typeof text>
  | ReturnType<typeof integer>
  | ReturnType<typeof pgBoolean>
  | ReturnType<typeof jsonb>
  | ReturnType<typeof pgTimestamp>
  | ReturnType<typeof pgUuid>;

type NotNull<T> = T extends { notNull(): infer R } ? R : never;
type Unique<T> = T extends { unique(): infer R } ? R : never;
type PrimaryKey<T> = T extends { primaryKey(): infer R } ? R : never;
type Default<T> = T extends { default(value: any): infer R } ? R : never;

export class ColumnBuilder<
  TType extends ColumnType,
  TValue,
  TRequired extends boolean = false,
  TDrizzle extends AnyDrizzleColumnBuilder = AnyDrizzleColumnBuilder,
> {
  declare readonly $type: TValue;
  declare readonly $required: TRequired;
  declare readonly $drizzle: TDrizzle;

  private readonly definition: ColumnDefinition<TType, TValue, TRequired>;
  private readonly drizzle: TDrizzle;

  constructor(
    definition: ColumnDefinition<TType, TValue, TRequired>,
    drizzle: TDrizzle,
  ) {
    this.definition = definition;
    this.drizzle = drizzle;
  }

  required(): ColumnBuilder<TType, TValue, true, NotNull<TDrizzle>> {
    return new ColumnBuilder(
      {
        ...this.definition,
        required: true,
      },
      this.drizzle.notNull() as NotNull<TDrizzle>,
    );
  }

  unique(): ColumnBuilder<TType, TValue, TRequired, Unique<TDrizzle>> {
    return new ColumnBuilder(
      {
        ...this.definition,
        unique: true,
      },
      this.drizzle.unique() as Unique<TDrizzle>,
    );
  }

  primaryKey(): ColumnBuilder<TType, TValue, true, PrimaryKey<TDrizzle>> {
    return new ColumnBuilder(
      {
        ...this.definition,
        required: true,
        primaryKey: true,
      },
      this.drizzle.primaryKey() as PrimaryKey<TDrizzle>,
    );
  }

  default(
    value: TValue,
  ): ColumnBuilder<TType, TValue, TRequired, Default<TDrizzle>> {
    return new ColumnBuilder(
      {
        ...this.definition,
        default: value,
      },
      this.drizzle.default(value as never) as Default<TDrizzle>,
    );
  }

  build(): ColumnDefinition<TType, TValue, TRequired> {
    return this.definition;
  }

  toDrizzle(): TDrizzle {
    return this.drizzle;
  }
}

export type AnyColumnBuilder = ColumnBuilder<any, any, any, any>;

export type InferColumnType<TColumn extends AnyColumnBuilder> =
  TColumn["$required"] extends true
    ? TColumn["$type"]
    : TColumn["$type"] | null;

export type InferTable<TColumns extends Record<string, AnyColumnBuilder>> = {
  [K in keyof TColumns]: InferColumnType<TColumns[K]>;
};

export type DrizzleColumns<TColumns extends Record<string, AnyColumnBuilder>> =
  {
    -readonly [K in keyof TColumns]: TColumns[K]["$drizzle"];
  };

export type DefineTable<TColumns extends Record<string, AnyColumnBuilder>> = {
  name?: string;
  columns: TColumns;
};

export function defineTable<
  const TColumns extends Record<string, AnyColumnBuilder>,
>(table: DefineTable<TColumns>) {
  return table;
}

export type DrizzleTableFromDefineTable<
  TTable extends DefineTable<any> & { name: string },
> = ReturnType<typeof createDrizzleTable<TTable["name"], TTable["columns"]>>;

export function createDrizzleTable<
  const TName extends string,
  const TColumns extends Record<string, AnyColumnBuilder>,
>(table: DefineTable<TColumns> & { name: TName }) {
  const columns = {} as DrizzleColumns<TColumns>;

  for (const key of Object.keys(table.columns) as Array<keyof TColumns>) {
    columns[key] = table.columns[key].toDrizzle();
  }

  return pgTable(table.name, columns);
}

export function string() {
  return new ColumnBuilder<"string", string, false, ReturnType<typeof text>>(
    { type: "string" },
    text(),
  );
}

export function number() {
  return new ColumnBuilder<"number", number, false, ReturnType<typeof integer>>(
    { type: "number" },
    integer(),
  );
}

export function boolean() {
  return new ColumnBuilder<
    "boolean",
    boolean,
    false,
    ReturnType<typeof pgBoolean>
  >({ type: "boolean" }, pgBoolean());
}

export function json<TValue = unknown>() {
  const column = jsonb().$type<TValue>();

  return new ColumnBuilder<"json", TValue, false, typeof column>(
    { type: "json" },
    column,
  );
}

export function timestamp() {
  return new ColumnBuilder<
    "timestamp",
    Date,
    false,
    ReturnType<typeof pgTimestamp>
  >({ type: "timestamp" }, pgTimestamp({ withTimezone: true }));
}

export function uuid() {
  return new ColumnBuilder<"uuid", string, false, ReturnType<typeof pgUuid>>(
    { type: "uuid" },
    pgUuid(),
  );
}
