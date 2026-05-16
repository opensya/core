import './utils/set-globals';

import { resolve } from 'node:path';
import { execo } from './utils/execo';
import { entry } from './entry';
import { Env } from './utils/env';

const env = Env.create({
  CORE_ENV: Env.schema
    .enum(['factory', 'development', 'production', 'test'] as const)
    .optional()
    .default('development'),
});

let cwd = process.cwd();
if (env.CORE_ENV === 'factory') cwd = resolve(cwd, 'playground');

void entry(
  async (config, { dirs, env }) => {
    const command = 'tsx';
    const args: string[] = [];

    if (env.CORE_ENV === 'factory') {
      args.push(`--tsconfig`, resolve(__dirname, '../tsconfig.dev.json'));
    }

    args.push(resolve(__dirname, './nest/runner/dev'));

    await execo([command, ...args], { cwd: dirs.dir });
  },
  {
    cwd,

    envDefinition: {
      CORE_ENV: Env.schema.enum(['factory'] as const).optional(),
      NODE_ENV: Env.schema
        .enum(['development', 'production', 'test'] as const)
        .optional(),
    },
    envOptions: { processEnv: false },
  },
).catch(console.log);
