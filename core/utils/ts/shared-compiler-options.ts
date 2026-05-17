import { $CompilerOptions } from './ts';

export function createSharedCompilerOptions(): $CompilerOptions {
  return {
    strict: true,
    target: 'ESNext',
    sourceMap: true,
    incremental: true,
    skipLibCheck: true,
    forceConsistentCasingInFileNames: true,
    moduleDetection: 'force',
    pretty: true,

    // strict: true,
    // resolvePackageJsonExports: true,
    // esModuleInterop: true,
    // isolatedModules: true,
    // declaration: true,
    // removeComments: false,
    // allowSyntheticDefaultImports: true,
    // target: 'ESNext',
    // sourceMap: true,
    // incremental: true,
    // forceConsistentCasingInFileNames: true,
    // skipLibCheck: true,
    // preserveSymlinks: true,
    // composite: true,
    // moduleDetection: 'force',
    // pretty: true,
  };
}
