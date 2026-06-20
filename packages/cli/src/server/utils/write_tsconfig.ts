import { join, relative } from 'node:path';
import { atomicWriteFile, normalizeDir } from '@core/utils';
import { getDirs } from '../../utils';

export function writeTsconfig() {
  const dirs = getDirs();

  const include: string[] = [
    normalizeDir(
      relative(dirs.OUTPUT_DIR, join(dirs.INPUT_DIR_SERVER, '**/*.ts')),
    ),

    normalizeDir(
      relative(dirs.OUTPUT_DIR, join(import.meta.dirname, '../**/*.ts')),
    ),
    normalizeDir(
      relative(dirs.OUTPUT_DIR, join(import.meta.dirname, '../**/*.d.ts')),
    ),

    normalizeDir(
      relative(
        dirs.OUTPUT_DIR,
        join(dirs.OUTPUT_DIR_SERVER, 'types/**/*.d.ts'),
      ),
    ),
  ];

  const exclude: string[] = [];

  const tsconfig = {
    extends: '@core/tsconfig/base.json',

    compilerOptions: {
      sourceMap: true,
      incremental: true,
      moduleDetection: 'force',
      pretty: true,

      experimentalDecorators: true,
      emitDecoratorMetadata: true,

      composite: true,
      declaration: true,
    },

    include,
    exclude,
  };

  atomicWriteFile(
    join(dirs.OUTPUT_DIR, 'tsconfig.server.json'),
    JSON.stringify(tsconfig, undefined, 2),
  );
}
