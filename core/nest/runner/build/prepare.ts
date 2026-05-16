import '../../utils/set-globals.js';
import { getDirs } from '@opensya/config';
import { copyLocales } from '../../utils/i18n';
import { writeTsconfig } from '../../utils/ts';

export function prepareBuild() {
  const dirs = getDirs(_config);

  function clean() {
    dirs.dist.server.remove({ recursive: true, force: true });
  }

  function ensureDist() {
    dirs.dist.server.ensureExists();
  }

  function tsconfig() {
    writeTsconfig(_config, {
      merge: {
        compilerOptions: {
          rootDir: dirs.root.server.relative.to(dirs.output.dir).dir,
          outDir: dirs.dist.server.relative.to(dirs.output.dir).dir,
        },
      },
      name: 'build',
    });
  }

  void clean();
  void ensureDist();
  void copyLocales(_config);
  void tsconfig();
}
