import '../../utils/set-globals.js';
import { getDirs, useDir } from '@opensya/config';
import { writeTsconfig } from '../../utils/ts';
import { resolve } from 'node:path';
import { writeFileSync } from 'fs-extra';

export function devPrepare() {
  const dirs = getDirs(_config);

  function clean() {
    dirs.output.server.remove({ recursive: true, force: true });
    dirs.dist.server.remove({ recursive: true, force: true });
  }

  function ensureOutput() {
    dirs.output.server.ensureExists();
    dirs.output.server.types.ensureExists();
  }

  function writeMainJs() {
    const bootstrapDir = useDir({
      dir:
        _env.CORE_ENV === 'factory'
          ? resolve(__dirname, '../../bootstrap')
          : resolve(__dirname, '../../bootstrap.js'),
    });

    const code = [
      "import { nestEntry } from '@core/nest/entry'",
      `import { bootstrap } from '${bootstrapDir.relative.to(dirs.output.server.dir).dir}';`,
      '',
      'nestEntry(() => {',
      ' bootstrap();',
      '});',
      '',
    ].join('\n');

    writeFileSync(dirs.output.server.mainjs.dir, code);
  }

  void clean();
  void ensureOutput();
  void writeMainJs();
  void writeTsconfig(_config);
}
