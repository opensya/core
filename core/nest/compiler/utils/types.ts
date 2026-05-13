import { readdirSync, writeFileSync } from 'fs-extra';
import { getDirsv3, normalizeDir } from '@opensya/config';
import { join } from 'node:path';

export function syntheseTypes() {
  const dirs = getDirsv3();

  // const coreNestTypes = useDir({ dir: join(__CORE_ROOT_DIR__, 'nest/types') });
  const types = [
    // `/// <reference types="${dirs.output.dist.server.types.relative.from.this(coreNestTypes)}" />`,
  ];

  const definitionDirs = readdirSync(dirs.output.server.types.dir).filter(
    (dir) => dir !== 'index.d.ts',
  );

  for (const dir of definitionDirs) {
    types.push(`/// <reference types="${normalizeDir(dir)}" />`);
  }

  const content = `${types.join('\n')}\n\nexport {};\n`;
  writeFileSync(join(dirs.output.server.types.dir, 'index.d.ts'), content);
}
