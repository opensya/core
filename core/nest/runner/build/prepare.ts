import '../../utils/set-globals';
import { getDirs, OpensyaConfigOutput } from '@opensya/config';
import { copyLocales } from '../../utils/copy-locales';
import { writeTsconfig } from '../../utils/ts';

export function prepareBuild(config: OpensyaConfigOutput) {
  globalThis._config = config;
  const dirs = getDirs(config);

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
          outDir: dirs.dist.relative.to(dirs.output.dir),
        },
      },
    });
  }

  void clean();
  void ensureDist();
  void copyLocales(config);
  void tsconfig();
}
