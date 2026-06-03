import { execo } from '#core/utils/execo';
import { useDir } from '@opensya/config';
import { nestEntry } from '#core/nest/entry';
import { runPrepare } from '../prepare';
import { copySync } from 'fs-extra';
import { writeServerBuildTsconfig } from '#core/nest/utils';
import { writeMainJs as wMainjs } from '#core/nest/utils/write-mainjs';

export async function runBuild() {
  const { dirs } = await nestEntry();

  logger.start('Start Server building ...');

  void runPrepare({
    async cb() {
      function copyLocales() {
        if (!dirs.root.server.locales.exists()) return;
        dirs.dist.server.locales.ensureExists();

        copySync(dirs.root.server.locales.dir, dirs.dist.server.locales.dir);
      }

      function writeMainJs() {
        if (_config.template !== 'core') return;
        const mainjsPath = dirs.dist.server.join('main.js').dir;

        wMainjs(mainjsPath);
      }

      async function build() {
        await execo(
          [
            'rslib',
            'build',

            '--config',
            useDir({ dir: __dirname }).join('rslib.config.js').dir,
          ],
          {
            wait: true,
            cwd: dirs.dir,
            env: {
              ...process.env,
              RSLIB_TSCONFIG: dirs.output.join('tsconfig.server.build.json')
                .dir,
            },
          },
        );
      }

      void writeServerBuildTsconfig(_config);
      await build();
      void writeMainJs();
      void copyLocales();

      logger.success('Server build completed');
    },
  });
}
