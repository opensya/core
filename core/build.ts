import './utils/set-globals';

import { config as dotenv } from 'dotenv';
import { join } from 'node:path';
import { execo } from './utils/execo';
import { loadConfig } from '@opensya/config';
import { prepareBuild } from './nest/runner/build/prepare';

void (() => {
  dotenv();
  const cwd = join(process.cwd(), process.env.CWD_PATH ?? '');

  void loadConfig(cwd).then((config) => {
    globalThis._config = config;

    void buildNest();

    async function buildNest() {
      prepareBuild(config);

      const cmd = ['tsc', '-b'];
      await execo(cmd, { cwd, wait: true });
    }
  });
})();
