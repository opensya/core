import {
  InferRawDocType,
  Schema,
  SchemaDefinition,
  SchemaOptions,
} from 'mongoose';

export type ModelManifest = {
  file: string;
  name: string;
  schema: string;
};

export type Model0 = {
  name?: string;
  schema: Schema;
  factory?: () => void;
};

// export type Model<TSchema extends Schema = Schema> = {
//   name?: string;
//   schema: TSchema;
//   factory?: (schema: TSchema) => void;
// };

export type Model<TSchema = unknown> = {
  name?: string;

  schema: SchemaDefinition<TSchema>;

  options?: SchemaOptions<TSchema>;

  factory?: (schema: Schema<TSchema>) => void;
};

type IsAny<T> = 0 extends 1 & T ? true : false;

export type InferModelSchema<T extends { schema: any }> =
  T extends Model<infer TSchema>
    ? IsAny<TSchema> extends true
      ? InferRawDocType<T['schema']>
      : unknown extends TSchema
        ? InferRawDocType<T['schema']>
        : TSchema
    : InferRawDocType<T['schema']>;

export type InferModelDocument<T extends { schema: any }> =
  import('mongoose').HydratedDocument<InferModelSchema<T>>;

export type InferModel<T extends { schema: any }> = import('mongoose').Model<
  InferModelDocument<T>
>;
