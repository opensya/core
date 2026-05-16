import { writeFileSync } from 'fs-extra';
import { resolve } from 'node:path';
import { getDirs, OpensyaConfigOutput, useDir } from '@opensya/config';
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
  moduleDetection?: Lowercase<keyof typeof ModuleDetectionKind>;
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
  const coreDir = useDir({ dir: resolve(__dirname, '../../../') });
  const _rootDir = useDir({ dir: rootDir ?? dirs.output.dir });

  const include: string[] = [];
  const exclude: string[] = [];
  let paths: ServerConfig['paths'] = {};

  if (!merge.include) {
    if (_env.CORE_ENV === 'factory') {
      include.push(
        coreDir.resolve('utils/env').relative.to(outputDir).normalize().dir,
      );
    } else {
      include.push(
        coreDir.resolve('utils/env.d.ts').relative.to(outputDir).normalize()
          .dir,
      );
    }

    if (_env.CORE_ENV == 'factory') {
      include.push(
        coreDir.join('nest/**/*.ts').relative.to(outputDir).normalize().dir,
      );
    } else {
      include.push(
        coreDir.join('nest/**/*.d.ts').relative.to(outputDir).normalize().dir,
      );
    }

    include.push(
      dirs.output.server.types
        .join('**/*.d.ts')
        .relative.to(outputDir)
        .normalize().dir,
    );

    include.push(
      dirs.root.server.join('**/*.ts').relative.to(outputDir).normalize().dir,

      dirs.root.server.join('**/*d.ts').relative.to(outputDir).normalize().dir,
    );

    const node_modules = dirs.join('node_modules');
    if (node_modules.exists()) {
      exclude.push(node_modules.relative.to(dirs.output.server.dir).dir);
    }

    if (dirs.dist.exists()) {
      exclude.push(dirs.dist.relative.to(outputDir).dir);
    }

    _.merge(paths, {
      '@core/*': [coreDir.join('./*').relative.to(outputDir).normalize().dir],
      '@nest/*': [
        coreDir.join('./nest/*').relative.to(outputDir).normalize().dir,
      ],
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
    moduleDetection: 'force',
    pretty: true,
  };

  const tsconfig: TSConfig = {
    compilerOptions,
    exclude,
    include,
  };

  _.merge(tsconfig, merge);

  const _name = name ? `tsconfig.server.${name}.json` : 'tsconfig.server.json';
  const path = dirs.output.join(_name).dir;
  writeFileSync(path, JSON.stringify(tsconfig, null, 2));

  return {
    path,
    tsconfig,
    compilerOptions: compilerOptions as CompilerOptions,
  };
}
