import { join, relative } from 'node:path';
import { atomicWriteFile, normalizeDir } from '@core/utils';
import { INPUT_DIR_SERVER, OUTPUT_DIR, OUTPUT_DIR_SERVER } from '../../utils';

export function writeTsconfig() {
  const include: string[] = [
    normalizeDir(relative(OUTPUT_DIR, join(INPUT_DIR_SERVER, '**/*.ts'))),

    normalizeDir(relative(OUTPUT_DIR, join(import.meta.dirname, '../**/*.ts'))),
    normalizeDir(
      relative(OUTPUT_DIR, join(import.meta.dirname, '../**/*.d.ts')),
    ),

    normalizeDir(
      relative(OUTPUT_DIR, join(OUTPUT_DIR_SERVER, 'types/**/*.d.ts')),
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
    join(OUTPUT_DIR, 'tsconfig.server.json'),
    JSON.stringify(tsconfig, undefined, 2),
  );
}
