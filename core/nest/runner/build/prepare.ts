import '../../utils/set-globals';
import { getProjectDirsv2, OpensyaConfigOutput } from '@opensya/config';
import { copyLocales } from '../../utils/copy-locales';
import { writeTsconfig } from '../../utils/ts';

export function prepareBuild(config: OpensyaConfigOutput) {
  globalThis._config = config;
  const dirs = getProjectDirsv2(config);

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
          outDir: dirs.dist.relative.to.this(dirs.output.dir),
        },
      },
    });
  }

  void clean();
  void ensureDist();
  void copyLocales(config);
  void tsconfig();
}
