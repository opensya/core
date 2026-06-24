import {
  boolean as pgBoolean,
  integer,
  jsonb,
  text,
  timestamp as pgTimestamp,
  uuid as pgUuid,
  pgTable,
} from "drizzle-orm/pg-core";

export type AnyDrizzleColumnBuilder =
  | ReturnType<typeof text>
  | ReturnType<typeof integer>
  | ReturnType<typeof pgBoolean>
  | ReturnType<typeof jsonb>
  | ReturnType<typeof pgTimestamp>
  | ReturnType<typeof pgUuid>;

type HiddenDrizzleMethods = "primaryKey" | "notNull";

type EnhanceMethod<TFn> = TFn extends (...args: infer Args) => infer R
  ? R extends AnyDrizzleColumnBuilder
    ? (...args: Args) => EnhancedColumn<R>
    : TFn
  : TFn;

type EnhanceDrizzleMethods<T> = {
  [K in keyof Omit<T, HiddenDrizzleMethods>]: EnhanceMethod<
    Omit<T, HiddenDrizzleMethods>[K]
  >;
};

type EnhancedColumn<T> = EnhanceDrizzleMethods<T> & {
  primary(): T extends { primaryKey(): infer R }
    ? EnhancedColumn<R>
    : EnhancedColumn<T>;

  require(): T extends { notNull(): infer R }
    ? EnhancedColumn<R>
    : EnhancedColumn<T>;
};

function buildColumn<TDrizzle extends AnyDrizzleColumnBuilder>(
  column: TDrizzle,
): EnhancedColumn<TDrizzle> {
  const wrapped = Object.assign(column, {
    primary() {
      return buildColumn(column.primaryKey() as AnyDrizzleColumnBuilder);
    },

    require() {
      return buildColumn(column.notNull() as AnyDrizzleColumnBuilder);
    },
  });

  return wrapped as unknown as EnhancedColumn<TDrizzle>;
}

export const uuid = () => buildColumn(pgUuid());
export const int = () => buildColumn(integer());
export const json = () => buildColumn(jsonb());
export const string = () => buildColumn(text());
export const timestamp = () => buildColumn(pgTimestamp());
export const boolean = () => buildColumn(pgBoolean());

export type TableMeta = {
  name: string;
  tableName: string;
  typeName: string;
  file: string;
};

export type TColumns<T extends Record<string, AnyDrizzleColumnBuilder>> = {
  [K in keyof T]: EnhancedColumn<T[K]>;
};

export type DefineTable<
  TName extends string,
  TColumns extends Record<string, AnyDrizzleColumnBuilder>,
> = {
  name: TName;
  columns: TColumns;
};

export function defineTable<T extends Record<string, AnyDrizzleColumnBuilder>>({
  columns,
}: {
  columns: TColumns<T>;
}) {
  return { columns: columns } as unknown as DefineTable<string, T>;
}

export function createDrizzleTable<
  TName extends string,
  TColumns extends Record<string, AnyDrizzleColumnBuilder>,
>(table: DefineTable<TName, TColumns>) {
  return pgTable(table.name, table.columns as unknown as TColumns);
}

// const name = "user" as const;

// const tableDefinition = defineTable({
//   columns: {
//     id: uuid().primary().defaultRandom(),
//     name: string().require(),
//     // age: int(),
//     // isActive: boolean().require(),
//     // metadata: json(),
//     // createdAt: timestamp().require(),
//   },
// });

// tableDefinition.name = name;

// export const users = createDrizzleTable(tableDefinition);

// db.insert(users).values({ name: "fsdf", });
