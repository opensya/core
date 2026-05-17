import type {
  HydratedDocument,
  InferRawDocType,
  Model as MongooseModel,
  Schema,
  SchemaDefinition,
  SchemaOptions,
} from 'mongoose';

export type Model<TSchema = unknown> = {
  name?: string;

  schema: SchemaDefinition<TSchema>;

  options?: SchemaOptions<TSchema>;

  factory?: (schema: Schema<TSchema>) => void;
};

type IsAny<T> = 0 extends 1 & T ? true : false;

export type InferModelSchema<T extends { schema: SchemaDefinition<any> }> =
  T extends Model<infer TSchema>
    ? IsAny<TSchema> extends true
      ? InferRawDocType<T['schema']>
      : unknown extends TSchema
        ? InferRawDocType<T['schema']>
        : TSchema
    : InferRawDocType<T['schema']>;

export type InferModelDocument<T extends { schema: SchemaDefinition<any> }> =
  HydratedDocument<InferModelSchema<T>>;

export type InferModel<T extends { schema: SchemaDefinition<any> }> =
  MongooseModel<InferModelSchema<T>>;

export {};
