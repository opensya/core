import { Env } from '@core/utils/env';

export const envDefinition = {
  CORE_ENV: Env.schema
    .enum(['factory', 'development', 'production', 'test'] as const)
    .optional()
    .default('development'),

  NEST_DATABASE_URL: Env.schema.string(),

  NEST_PORT: Env.schema.number().default(4720),
};
