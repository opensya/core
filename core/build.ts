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
      args.push(`--tsconfig`, resolve(process.cwd(), 'tsconfig.json'));
    }

    args.push(resolve(__dirname, './nest/runner/build'));

    void execo([command, ...args], { cwd: dirs.dir });
  },
  { processEnv: false, cwd },
);

// import './utils/set-globals';

// import { config as dotenv } from 'dotenv';
// import { join } from 'node:path';
// import { execo } from './utils/execo';
// import { loadConfig } from '@opensya/config';
// import { prepareBuild } from './nest/runner/build/prepare';

// void (() => {
//   dotenv();
//   const cwd = join(process.cwd(), process.env.CWD_PATH ?? '');

//   void loadConfig(cwd).then((config) => {
//     globalThis._config = config;

//     void buildNest();

//     async function buildNest() {
//       prepareBuild(config);

//       const cmd = ['tsc', '-b'];
//       await execo(cmd, { cwd, wait: true });
//     }
//   });
// })();
