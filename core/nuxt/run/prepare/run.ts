import { execo } from '#core/utils/execo';
import { nuxtEntry } from '#core/nuxt/entry';
import { prepare } from '../prepare';

export async function runPrepare() {
  const { dirs } = await nuxtEntry();

  async function run() {
    const command = 'nuxt';
    const args = ['prepare', `--cwd=${dirs.output.client.dir}`];

    await execo([command, ...args], { wait: true });
  }

  void prepare();
  await run();
}
