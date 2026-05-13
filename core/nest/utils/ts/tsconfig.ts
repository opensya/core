import { writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import _ from 'lodash';
import {
  getDirs,
  normalizeDirs,
  OpensyaConfigOutput,
  useDir,
} from '@opensya/config';
import {
  CompilerOptions,
  ModuleKind,
  ModuleResolutionKind,
  TypeAcquisition,
  ScriptTarget,
  ModuleDetectionKind,
} from 'typescript';
import { ServerConfig } from '../../types';

type $CompilerOptionss = Omit<
  CompilerOptions,
  'module' | 'moduleResolution' | 'target' | 'moduleDetection'
> & {
  module?: keyof typeof ModuleKind;
  moduleResolution?: keyof typeof ModuleResolutionKind;
  target?: keyof typeof ScriptTarget;
  moduleDetection?: keyof typeof ModuleDetectionKind;
  types?: any[];
};

interface TSConfig {
  compilerOptions?: $CompilerOptionss;
  exclude?: string[];
  compileOnSave?: boolean;
  extends?: string | string[];
  files?: string[];
  include?: string[];
  typeAcquisition?: TypeAcquisition;
  references?: {
    path: string;
  }[];
}

export function writeTsconfig(
  config: OpensyaConfigOutput,
  {
    merge = {},
    name,
    rootDir,
  }: {
    merge?: TSConfig;
    name?: string;
    rootDir?: string;
  } = {},
) {
  const dirs = getDirs(config);

  const outputDir = dirs.output.dir;
  const coreDir = useDir({ dir: resolve(__dirname, '../../..') });
  const _rootDir = useDir({ dir: rootDir ?? dirs.output.dir });

  const include: string[] = [];
  const exclude: string[] = [];
  let paths: ServerConfig['paths'] = {};

  if (!merge.include) {
    include.push(
      ...normalizeDirs([
        join(dirs.output.server.types.relative.from(outputDir), '**/*.d.ts'),
        join(dirs.root.server.relative.from(outputDir), '**/*.ts'),
        join(dirs.root.server.relative.from(outputDir), '**/*.d.ts'),
        join(coreDir.relative.from(outputDir), 'nest/types/**/*.d.ts'),
      ]),
    );

    const node_modules = useDir({ dir: dirs.join('node_modules') });
    if (node_modules.exists()) {
      exclude.push(node_modules.relative.from(dirs.output.server.dir));
    }

    if (dirs.dist.exists()) {
      exclude.push(dirs.dist.relative.from(outputDir));
    }

    _.merge(paths, {
      '@core/*': [join(_rootDir.relative.from(coreDir.dir), './*')],
      '@nest/*': [join(_rootDir.relative.from(coreDir.dir), 'nest/*')],
    });
  }

  // TODO à vérifier
  if (config.server && typeof config.server !== 'boolean') {
    paths = _.merge(paths, config.server?.paths);
  }

  const compilerOptions: $CompilerOptionss = {
    paths,
    strict: true,
    module: 'NodeNext',
    moduleResolution: 'NodeNext',
    resolvePackageJsonExports: true,
    esModuleInterop: true,
    isolatedModules: true,
    declaration: true,
    removeComments: false,
    emitDecoratorMetadata: true,
    experimentalDecorators: true,
    allowSyntheticDefaultImports: true,
    target: 'ESNext',
    sourceMap: true,
    incremental: true,
    tsBuildInfoFile: '.tsbuildinfo',
    forceConsistentCasingInFileNames: true,
    skipLibCheck: true,
    preserveSymlinks: true,
    composite: true,
    moduleDetection: 'Force',
    pretty: true,
  };

  const tsconfig: TSConfig = {
    compilerOptions,
    exclude,
    include,
  };

  _.merge(tsconfig, merge);

  const _name = name ? `tsconfig.${name}.server.json` : 'tsconfig.server.json';
  const path = dirs.output.join(_name);
  writeFileSync(path, JSON.stringify(tsconfig, null, 2));

  return {
    path,
    tsconfig,
    compilerOptions: compilerOptions as CompilerOptions,
  };
}
