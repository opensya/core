import './utils/set-globals';

import { resolve } from 'node:path';
import { execo } from './utils/execo';
import { nestEntry } from './nest/entry';
import { Env } from './utils/env';

const env = Env.create({
  CORE_ENV: Env.schema
    .enum(['factory', 'development', 'production', 'test'] as const)
    .optional()
    .default('development'),
});

let cwd = process.cwd();
if (env.CORE_ENV === 'factory') cwd = resolve(cwd, 'playground');

void nestEntry(
  (config, { dirs, env }) => {
    const command = 'tsx';
    const args: string[] = [];

    if (env.CORE_ENV === 'factory') {
      args.push(`--tsconfig`, resolve(__dirname, '../tsconfig.json'));
    }

    args.push(resolve(__dirname, './nest/runner/dev'));

    void execo([command, ...args], { cwd: dirs.dir });
  },
  { processEnv: false, cwd },
);
