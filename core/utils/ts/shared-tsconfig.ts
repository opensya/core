import { OpensyaConfigOutput } from '@opensya/config';
import { TSConfig } from './ts';
import { createSharedCompilerOptions } from './shared-compiler-options';
import { writeTsconfig } from './write-tsconfig';

export function writeSharedTsconfig(
  config: OpensyaConfigOutput,
  { merge = {} }: { merge?: TSConfig } = {},
) {
  const tsconfig: TSConfig = {
    compilerOptions: createSharedCompilerOptions(),
  };

  _.merge(tsconfig, merge);

  return writeTsconfig(config, tsconfig, { name: 'shared' });
}
