import { atomicWriteFile } from '#core/utils/atomic-write-file';
import { getDirs, useDir } from '@opensya/config';
import { resolve } from 'node:path';

export function writeMainJs(mainjsPath: string) {
  const dirs = getDirs(_config);
  const bootstrapDir = useDir({ dir: resolve(__dirname, '../bootstrap.js') });

  const code = [
    `import { bootstrap } from '${bootstrapDir.relative.to(dirs.output.server.dir).dir}';`,
    '',
    'bootstrap();',
    '',
  ].join('\n');

  atomicWriteFile(mainjsPath, code);
}
