import { join, relative } from 'node:path';
import { atomicWriteFile } from './atomic_write_ile';
import { findPackageRoot, normalizeDir } from '@core/utils';
import { fileURLToPath } from 'node:url';

export function writeTsconfig() {
  const _rootDirection = join(process.cwd(), 'server');
  const __dirname = fileURLToPath(import.meta.url);
  const packageRoot = findPackageRoot(__dirname);

  const include: string[] = [
    normalizeDir(relative(_outputDir, join(_rootDirection, '**/*.ts'))),
    normalizeDir(relative(_outputDir, join(packageRoot, 'dist', '**/*.d.mts'))),
    normalizeDir(relative(_outputDir, join(_outputDir, 'types/**/*.d.ts'))),
  ];

  // if (typeof __dirname === 'undefined') {
  //   include.push(
  //     normalizeDir(
  //       relative(
  //         _outputDir,
  //         join(
  //           findPackageRoot(fileURLToPath(import.meta.url)),
  //           'dist',
  //           '**/*.d.mts',
  //         ),
  //       ),
  //     ),
  //   );
  // } else {
  //   include.push(
  //     normalizeDir(
  //       relative(
  //         _outputDir,
  //         join(findPackageRoot(__dirname), 'dist', '**/*.d.cts'),
  //       ),
  //     ),
  //   );
  // }

  const exclude: string[] = [];

  const tsconfig = {
    compilerOptions: {
      strict: true,
      target: 'ESNext',
      sourceMap: true,
      incremental: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      moduleDetection: 'force',
      pretty: true,

      module: 'NodeNext',
      moduleResolution: 'NodeNext',

      experimentalDecorators: true,
      emitDecoratorMetadata: true,

      composite: true,
      declaration: true,
    },

    include,
    exclude,
  };

  atomicWriteFile(
    join(_outputDir, 'tsconfig.server.json'),
    JSON.stringify(tsconfig, undefined, 2),
  );
}
