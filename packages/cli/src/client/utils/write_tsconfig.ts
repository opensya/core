import { join, relative } from 'node:path';
import { atomicWriteFile, normalizeDir } from '@core/utils';
import { INPUT_DIR_CLIENT, OUTPUT_DIR } from '../../utils';

export function writeTsconfig() {
  const include: string[] = [
    normalizeDir(relative(OUTPUT_DIR, join(INPUT_DIR_CLIENT, '**/*.ts'))),

    normalizeDir(
      relative(OUTPUT_DIR, join(import.meta.dirname, '../**/*.d.ts')),
    ),
  ];

  const exclude: string[] = [];

  const tsconfig = {
    extends: '@core/tsconfig/react.json',

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
    join(OUTPUT_DIR, 'tsconfig.client.json'),
    JSON.stringify(tsconfig, undefined, 2),
  );
}
