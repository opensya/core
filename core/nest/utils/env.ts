import { Env } from '@core/utils/env';

export const envDefinition = {
  CORE_ENV: Env.schema.enum(['factory'] as const).optional(),

  NODE_ENV: Env.schema
    .enum(['development', 'production', 'test'] as const)
    .optional(),

  NEST_DATABASE_URL: Env.schema.string(),

  NEST_PORT: Env.schema.number().default(4720),
};
