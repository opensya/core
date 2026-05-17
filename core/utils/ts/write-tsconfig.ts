import { getDirs, OpensyaConfigOutput } from '@opensya/config';
import { CompilerOptions } from 'typescript';
import { atomicWriteFile } from '@core/utils/atomic-write-file';
import { TSConfig } from './ts';

export function writeTsconfig(
  config: OpensyaConfigOutput,
  tsconfig: TSConfig,
  { name }: { name?: string },
) {
  const dirs = getDirs(config);
  const filename = name ? `tsconfig.${name}.json` : 'tsconfig.json';
  const path = dirs.output.join(filename).dir;

  atomicWriteFile(path, JSON.stringify(tsconfig, null, 2));

  return {
    path,
    tsconfig,
    compilerOptions: tsconfig.compilerOptions as CompilerOptions,
  };
}
