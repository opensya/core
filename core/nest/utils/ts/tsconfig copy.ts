import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import _ from 'lodash';
import { getDirsv2, normalizeDirs, useDir } from '@opensya/config';
import {
  CompilerOptions,
  ModuleKind,
  ModuleResolutionKind,
  TypeAcquisition,
  ScriptTarget,
  ModuleDetectionKind,
} from 'typescript';
import { replaceTscAliasPaths } from 'tsc-alias';
import { ServerConfig } from '@nest/types';

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

export function writeTsconfig({
  merge = {},
  name,
  rootDir,
  noInjectTypes,
}: {
  merge?: TSConfig;
  name?: string;
  rootDir?: string;
  noInjectTypes?: boolean;
} = {}) {
  const dirs = getDirsv2();

  const include: string[] = [];
  const exclude: string[] = [];

  rootDir ??= dirs.root.server.relative.from.outputServer();

  if (!merge.include) {
    include.push(
      ...normalizeDirs([
        join(rootDir, '**/*.ts'),
        // dirs.opensyaConfigFile.relative.from.outputServer(),
        // join(dirs.root.server.fromOutputServer, '**/*.d.ts'),
        // join(dirs.output.server.types.fromOutputServer, '**/*.d.ts'),
        // dirs.opensyaConfigFile.fromOutputServer,
      ]),
    );

    exclude.push(
      dirs.root.server.models.join.relativeFromOutputServerToHere('**/*.ts'),
      dirs.root.server.services.join.relativeFromOutputServerToHere('**/*.ts'),
      dirs.root.server.controllers.join.relativeFromOutputServerToHere(
        '**/*.ts',
      ),

      dirs.output.dist.server.relative.from.outputServer(),
    );

    const node_modules = useDir({ dir: dirs.join.this('node_modules') });
    if (node_modules.exists()) {
      exclude.push(node_modules.relative.from.outputServer());
    }
  }

  let paths: ServerConfig['paths'] = {};

  // TODO à vérifier
  if (_config.server && typeof _config.server !== 'boolean') {
    paths = _.merge(paths, _config.server?.paths);
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
    outDir: dirs.output.dist.server.relative.from.outputServer(),
    baseUrl: rootDir,
    rootDir: rootDir,
    incremental: true,
    tsBuildInfoFile: '.tsbuildinfo',
    forceConsistentCasingInFileNames: true,
    skipLibCheck: true,
    preserveSymlinks: true,
    composite: true,
    moduleDetection: 'Force',
    pretty: true,
  };

  if (!noInjectTypes && !dirs.output.dist.server.types.isEmpty()) {
    compilerOptions.types ??= [];
    compilerOptions.types.push(
      dirs.output.dist.server.types.relative.from.outputServer(),
    );
  }

  const tsconfig: TSConfig = {
    compilerOptions,
    exclude,
    include,
  };

  _.merge(tsconfig, merge);

  const _name = name ? `tsconfig.${name}.json` : 'tsconfig.json';
  const _nameBuild = name
    ? `tsconfig.${name}.build.json`
    : 'tsconfig.build.json';

  const path = dirs.output.dist.server.join.this(_name);

  writeFileSync(path, JSON.stringify(tsconfig, null, 2));

  const tsconfigBuild = {
    extends: _name,
    exclude: ['node_modules', 'dist', 'test', '**/*spec.ts'],
  };

  writeFileSync(
    dirs.output.dist.server.join.this(_nameBuild),
    JSON.stringify(tsconfigBuild, null, 2),
  );

  return {
    path,
    tsconfig,
    compilerOptions: compilerOptions as CompilerOptions,
  };
}

export async function parseRoot(project: string) {
  await replaceTscAliasPaths({ configFile: project });
}
