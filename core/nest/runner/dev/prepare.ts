import { getDirs, useDir } from '@opensya/config';
import { writeServerTsconfig } from '../../utils';
import { resolve } from 'node:path';
import { atomicWriteFile } from '#core/utils/atomic-write-file';

export function devPrepare() {
  const dirs = getDirs(_config);

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

    const entryDir = useDir({
      dir:
        _env.CORE_ENV === 'factory'
          ? resolve(__dirname, '../../entry')
          : resolve(__dirname, '../../entry.js'),
    });

    const code = [
      `import { nestEntry } from '${entryDir.relative.to(dirs.output.server.dir).dir}'`,
      `import { bootstrap } from '${bootstrapDir.relative.to(dirs.output.server.dir).dir}';`,
      '',
      'nestEntry(() => {',
      ' bootstrap();',
      '});',
      '',
    ].join('\n');

    atomicWriteFile(dirs.output.server.mainjs.dir, code);
  }

  void ensureOutput();
  void writeMainJs();
  void writeServerTsconfig(_config);
}
