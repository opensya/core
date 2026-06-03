import { execo } from '#core/utils/execo';
import { useDir } from '@opensya/config';
import { nuxtEntry } from '#core/nuxt/entry';
import { prepare } from '../prepare';

export async function runBuild() {
  const { dirs } = await nuxtEntry();

  async function runApp() {
    const command = 'nuxt';
    const args = ['build', `--cwd=${dirs.output.client.dir}`];

    await execo([command, ...args], {
      wait: true,
      env: { ...process.env, NODE_ENV: 'production' },
    });
  }

  async function runModule() {
    const command = 'rslib';
    const args = [
      'build',
      '--config',
      useDir({ dir: __dirname }).join('rslib.config.js').dir,
    ];

    await execo([command, ...args], {
      wait: true,
      cwd: dirs.dir,
      env: {
        ...process.env,
        NODE_ENV: 'production',
        OPENSYA_MODULE_CWD: dirs.dir,
      },
    });
  }

  void prepare();

  if (_config.template === 'module') void runModule();
  else void runApp();
}
