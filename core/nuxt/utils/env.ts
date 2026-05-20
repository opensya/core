import { Env } from '../../utils/env';

export const envDefinition = {
  CORE_ENV: Env.schema.enum(['factory'] as const).optional(),

  NODE_ENV: Env.schema
    .enum(['development', 'production', 'test'] as const)
    .optional(),

  NUXT_PORT: Env.schema.number().default(4730),
};
