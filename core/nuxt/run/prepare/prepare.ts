import { generateNuxtConfig } from '#core/nuxt/utils/gen-nuxt-config';
import { writeClientTsconfig } from '#core/nuxt/utils/write-tsconfig';
import { atomicWriteFile } from '#core/utils/atomic-write-file';
import { getDirs, useDir } from '@opensya/config';

export function runPrepare() {
  const dirs = getDirs(_config);

  function ensureOutput() {
    dirs.output.client.ensureExists();
  }

  function createNuxtConfigFile() {
    const modules: string[] = [];

    const moduleLoaderDir = useDir({ dir: __dirname }).join(
      '../../utils/module-loader/index.js',
    );
    modules.push(moduleLoaderDir.relative.to(dirs.output.client.dir).dir);

    const nuxtConfigFile = dirs.output.client.join('nuxt.config.ts');
    atomicWriteFile(
      nuxtConfigFile.dir,
      generateNuxtConfig({
        cwd: _config.cwd,
        modules,
        srcDir: dirs.root.client.relative.to(dirs.output.client.dir).normalize()
          .dir,
        buildDir: dirs.dist.client.relative
          .to(dirs.output.client.dir)
          .normalize().dir,
      }),
    );
  }

  void ensureOutput();
  void createNuxtConfigFile();
  void writeClientTsconfig(_config);
}
