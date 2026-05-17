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
import { writeSharedTsconfig } from '@core/utils/ts/shared-tsconfig';
import { writeTsconfig } from '@core/utils/ts/write-tsconfig';
import { writeNodeTsconfig } from '@core/utils/ts/node-tsconfig';
import { getCoreDir, getCoreResolvePaths } from '@core/utils/ts/core-paths';
import { $CompilerOptions } from '@core/utils/ts';

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

export function writeServerTsconfig(
  config: OpensyaConfigOutput,
  {
    merge = {},
    name,
  }: {
    merge?: TSConfig;
    name?: string;
  } = {},
) {
  const dirs = getDirs(config);

  // TODO à sortir d'ici
  writeSharedTsconfig(config);
  writeNodeTsconfig(config);

  const outputDir = dirs.output.dir;
  const coreDir = getCoreDir();

  const include: string[] = [];
  const exclude: string[] = [];
  const paths: $CompilerOptions['paths'] = getCoreResolvePaths(config);

  if (!merge.include) {
    include.push(
      dirs.output.server.types
        .join('index.d.ts')
        .relative.to(outputDir)
        .normalize().dir,
      dirs.output.server.types
        .join('**/*.d.ts')
        .relative.to(outputDir)
        .normalize().dir,
      dirs.root.server.join('**/*.d.ts').relative.to(outputDir).normalize().dir,
      dirs.root.server.join('**/*.ts').relative.to(outputDir).normalize().dir,
    );

    if (_env.CORE_ENV === 'factory') {
      include.push(
        coreDir.join('nest/**/*.ts').relative.to(outputDir).normalize().dir,
        coreDir.resolve('utils/**/*.ts').relative.to(outputDir).normalize().dir,
      );
    } else {
      include.push(
        coreDir.resolve('utils/*.d.ts').relative.to(outputDir).normalize().dir,
        coreDir.join('nest/**/*.d.ts').relative.to(outputDir).normalize().dir,
      );
    }

    // const nodeModulesDir = dirs.join('node_modules');
    // if (nodeModulesDir.exists()) {
    //   exclude.push(nodeModulesDir.relative.to(outputDir).normalize().dir);
    // }

    if (dirs.dist.exists()) {
      exclude.push(dirs.dist.relative.to(outputDir).normalize().dir);
    }
  }

  if (config.server) _.merge(paths, config.server.paths);

  const tsconfig: TSConfig = {
    extends: './tsconfig.shared.json',
    compilerOptions: {
      module: 'NodeNext',
      moduleResolution: 'NodeNext',

      experimentalDecorators: true,
      emitDecoratorMetadata: true,

      composite: true,
      declaration: true,

      tsBuildInfoFile: './server/.tsbuildinfo',

      paths,
    },
    include,
    exclude,
  };

  _.merge(tsconfig, merge);

  name = name ? `server.${name}` : 'server';
  writeTsconfig(config, tsconfig, { name });

  return writeTsconfig(config, tsconfig, { name });
}
