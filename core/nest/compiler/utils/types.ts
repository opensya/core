import { readdirSync } from 'fs-extra';
import { getDirs, normalizeDir } from '@opensya/config';
import { join } from 'node:path';
import { atomicWriteFile } from '#core/utils/atomic-write-file';

export function syntheseTypes() {
  const dirs = getDirs(_config);

  const types = [];

  const definitionDirs = readdirSync(dirs.output.server.types.dir).filter(
    (dir) => dir !== 'index.d.ts',
  );

  for (const dir of definitionDirs) {
    types.push(`/// <reference path="${normalizeDir(dir)}" />`);
  }

  const content = `${types.join('\n')}\n\nexport {};\n`;
  atomicWriteFile(join(dirs.output.server.types.dir, 'index.d.ts'), content);
}
