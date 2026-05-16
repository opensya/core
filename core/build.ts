import { resolve } from 'node:path';
import { execo } from './utils/execo';
import { Env } from './utils/env';
import { entry } from './entry';

void entry(
  (config, { dirs, env }) => {
    const command = 'tsx';
    const args: string[] = [];

    if (env.CORE_ENV === 'factory') {
      args.push(`--tsconfig`, resolve(process.cwd(), 'tsconfig.json'));
    }

    args.push(resolve(__dirname, './nest/runner/build'));

    void execo([command, ...args], { cwd: dirs.dir });
  },
  {
    envDefinition: {
      CORE_ENV: Env.schema.enum(['factory'] as const).optional(),
      NODE_ENV: Env.schema
        .enum(['development', 'production', 'test'] as const)
        .optional(),
    },
    envOptions: { processEnv: false },
  },
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
