import { getDirs, OpensyaConfigOutput, useDir } from '@opensya/config';

export function getCoreResolvePaths(config: OpensyaConfigOutput) {
  const dirs = getDirs(config);
  const coreDir = getCoreDir();

  return {
    '#core': [coreDir.relative.to(dirs.output.dir).normalize().dir],
    '#core/*': [
      coreDir.join('/*').relative.to(dirs.output.dir).normalize().dir,
    ],
  };
}

export function getCoreDir() {
  const coreDir = useDir({ dir: __dirname }).join('../..');
  return coreDir;
}
