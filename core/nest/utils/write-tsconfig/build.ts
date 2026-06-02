import { getDirs, OpensyaConfigOutput } from '@opensya/config';
import {
  CompilerOptions,
  ModuleKind,
  ModuleResolutionKind,
  TypeAcquisition,
  ScriptTarget,
  ModuleDetectionKind,
} from 'typescript';
import { writeTsconfig } from '#core/utils/ts/write-tsconfig';
import { getCoreResolvePaths } from '#core/utils/ts/core-paths';
import { $CompilerOptions } from '#core/utils/ts';

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

export function writeServerBuildTsconfig(
  config: OpensyaConfigOutput,
  { merge = {} }: { merge?: TSConfig } = {},
) {
  const dirs = getDirs(config);

  const outputDir = dirs.output.dir;

  const include: string[] = [];
  const exclude: string[] = [];
  const paths: $CompilerOptions['paths'] = getCoreResolvePaths(config);

  include.push(
    dirs.root.server.join('**/*.d.ts').relative.to(outputDir).normalize().dir,
    dirs.root.server.join('**/*.ts').relative.to(outputDir).normalize().dir,
    dirs.output.server.types
      .join('**/*.d.ts')
      .relative.to(outputDir)
      .normalize().dir,
  );

  exclude.push(
    dirs.root.server.join('**/*.spec.ts').relative.to(outputDir).normalize()
      .dir,

    dirs.root.server.join('**/*.test.ts').relative.to(outputDir).normalize()
      .dir,
  );

  if (dirs.dist.exists()) {
    exclude.push(dirs.dist.relative.to(outputDir).normalize().dir);
  }

  if (config.server) _.merge(paths, config.server.paths);

  const tsconfig: TSConfig = {
    extends: './tsconfig.server.json',
    compilerOptions: {
      composite: false,
      declaration: true,
      declarationMap: false,
      noEmit: false,
      emitDeclarationOnly: false,
      rootDir: dirs.relative.to(dirs.output.dir).dir,
      outDir: dirs.dist.relative.to(dirs.output.dir).dir,
    },
    include,
    exclude,
  };

  _.merge(tsconfig, merge);

  return writeTsconfig(config, tsconfig, { name: `server.build` });
}
