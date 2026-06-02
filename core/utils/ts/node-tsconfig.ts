import { getDirs, OpensyaConfigOutput, useDir } from '@opensya/config';
import { TSConfig } from './ts';
import { writeTsconfig } from './write-tsconfig';
import { resolvePackageTypes } from '../resolve-package';
import { getCoreDir, getCoreResolvePaths } from './core-paths';

export function writeNodeTsconfig(
  config: OpensyaConfigOutput,
  { merge = {} }: { merge?: TSConfig } = {},
) {
  const dirs = getDirs(config);
  const coreDir = getCoreDir();
  const opensyaConfigTypes = resolvePackageTypes('@opensya/config');

  const include: string[] = [];

  include.push(
    dirs.join('opensya.config.ts').relative.to(dirs.output.dir).normalize().dir,
  );

  if (opensyaConfigTypes) {
    include.push(
      useDir({ dir: opensyaConfigTypes })
        .relative.to(dirs.output.dir)
        .normalize().dir,
    );
  }

  include.push(
    coreDir
      .join('nest/types/config.d.ts')
      .relative.to(dirs.output.dir)
      .normalize().dir,
  );

  const tsconfig: TSConfig = {
    extends: './tsconfig.shared.json',

    compilerOptions: {
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      composite: true,
      tsBuildInfoFile: './node/.tsbuildinfo',
      paths: getCoreResolvePaths(config),
    },

    include,
  };

  _.merge(tsconfig, merge);

  return writeTsconfig(config, tsconfig, { name: 'node' });
}
