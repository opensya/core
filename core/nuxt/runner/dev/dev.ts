import { execo } from '#core/utils/execo';
import { getDirs } from '@opensya/config';
import chokidar from 'chokidar';
import { devPrepare } from './prepare';
import { nuxtEntry } from '#core/nuxt/entry';

export async function dev() {
  void nuxtEntry(async () => {
    const dirs = getDirs(_config);

    async function run() {
      const command = 'nuxt';
      const args = ['dev', `--cwd=${dirs.output.client.dir}`];

      await execo([command, ...args], {});
    }

    void devPrepare();
    void run();
  });
}
