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

export class ColumnBuilder<
  TType extends ColumnType,
  TValue,
  TRequired extends boolean = false,
  TDrizzle extends AnyDrizzleColumnBuilder = AnyDrizzleColumnBuilder,
> {
  declare readonly $type: TValue;
  declare readonly $required: TRequired;
  declare readonly $drizzle: TDrizzle;

  protected readonly definition: ColumnDefinition<TType, TValue, TRequired>;

  constructor(definition: ColumnDefinition<TType, TValue, TRequired>) {
    this.definition = definition;
  }

  required(): ColumnBuilder<TType, TValue, true, TDrizzle> {
    return new ColumnBuilder({
      ...this.definition,
      required: true,
    });
  }

  unique(): ColumnBuilder<TType, TValue, TRequired, TDrizzle> {
    return new ColumnBuilder({
      ...this.definition,
      unique: true,
    });
  }

  primaryKey(): ColumnBuilder<TType, TValue, true, TDrizzle> {
    return new ColumnBuilder({
      ...this.definition,
      required: true,
      primaryKey: true,
    });
  }

  default(value: TValue): ColumnBuilder<TType, TValue, TRequired, TDrizzle> {
    return new ColumnBuilder({
      ...this.definition,
      default: value,
    });
  }

  build(): ColumnDefinition<TType, TValue, TRequired> {
    return this.definition;
  }

  toDrizzle(): AnyDrizzleColumnBuilder {
    const definition = this.definition;

    let column: AnyDrizzleColumnBuilder;

    switch (definition.type) {
      case "string":
        column = text();
        break;

      case "number":
        column = integer();
        break;

      case "boolean":
        column = pgBoolean();
        break;

      case "json":
        column = jsonb();
        break;

      case "timestamp":
        column = pgTimestamp({ withTimezone: true });
        break;

      case "uuid":
        column = pgUuid();
        break;

      default:
        throw new Error(`Unsupported column type: ${definition.type}`);
    }

    if (definition.primaryKey) {
      column = column.primaryKey();
    }

    if (definition.required) {
      column = column.notNull();
    }

    if (definition.unique) {
      column = column.unique();
    }

    if (definition.default !== undefined) {
      column = column.default(definition.default as never);
    }

    if (definition.type === "timestamp" && definition.defaultNow) {
      column = (column as ReturnType<typeof pgTimestamp>).defaultNow();
    }

    if (definition.type === "uuid" && definition.defaultRandom) {
      column = (column as ReturnType<typeof pgUuid>).defaultRandom();
    }

    return column;
  }
}

export type AnyColumnBuilder = ColumnBuilder<ColumnType, any, boolean, any>;

export type InferColumnType<TColumn> =
  TColumn extends ColumnBuilder<any, infer TValue, infer TRequired, any>
    ? TRequired extends true
      ? TValue
      : TValue | null
    : never;

export type InferTable<TColumns extends Record<string, AnyColumnBuilder>> = {
  [K in keyof TColumns]: InferColumnType<TColumns[K]>;
};

export type DrizzleColumns<TColumns extends Record<string, AnyColumnBuilder>> =
  {
    [K in keyof TColumns]: TColumns[K]["$drizzle"];
  };

export type DefineTable<TColumns extends Record<string, AnyColumnBuilder>> = {
  name?: string;
  columns: TColumns;
};

export function createDrizzleTable<
  TName extends string,
  TColumns extends Record<string, AnyColumnBuilder>,
>(table: DefineTable<TColumns> & { name: TName }) {
  const columns = {} as DrizzleColumns<TColumns>;

  for (const key of Object.keys(table.columns) as Array<keyof TColumns>) {
    columns[key] = table.columns[
      key
    ].toDrizzle() as DrizzleColumns<TColumns>[typeof key];
  }

  return pgTable(table.name, columns);
}

export function string() {
  return new ColumnBuilder<"string", string, false, ReturnType<typeof text>>({
    type: "string",
  });
}

export function number() {
  return new ColumnBuilder<"number", number, false, ReturnType<typeof integer>>(
    { type: "number" },
  );
}

export function boolean() {
  return new ColumnBuilder<
    "boolean",
    boolean,
    false,
    ReturnType<typeof pgBoolean>
  >({
    type: "boolean",
  });
}

export function json<TValue = unknown>() {
  return new ColumnBuilder<"json", TValue, false, ReturnType<typeof jsonb>>({
    type: "json",
  });
}

export function timestamp() {
  return new ColumnBuilder<
    "timestamp",
    Date,
    false,
    ReturnType<typeof pgTimestamp>
  >({
    type: "timestamp",
  });
}

export function uuid() {
  return new ColumnBuilder<"uuid", string, false, ReturnType<typeof pgUuid>>({
    type: "uuid",
  });
}
