import { execo } from '#core/utils/execo';
import { getDirs } from '@opensya/config';
import { nuxtEntry } from '#core/nuxt/entry';
import { prepare } from '../prepare';

export async function runDev() {
  void nuxtEntry(async () => {
    const dirs = getDirs(_config);

    async function run() {
      const command = 'nuxt';
      const args = ['dev', `--cwd=${dirs.output.client.dir}`];

      await execo([command, ...args]);
    }

    void prepare();
    void run();
  });
}
