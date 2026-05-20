import { getDirs, OpensyaConfigOutput } from '@opensya/config';
import { writeTsconfig } from '#core/utils/ts/write-tsconfig';
import { TSConfig } from '#core/utils/ts';

export function writeClientTsconfig(
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
  const outputDir = dirs.output.dir;

  const nuxtAppTsconfig = dirs.output.client
    .join('nuxt/tsconfig.app.json')
    .relative.to(outputDir)
    .normalize().dir;

  const tsconfig: TSConfig = {
    extends: [nuxtAppTsconfig, './tsconfig.shared.json'],

    compilerOptions: {
      composite: true,
      noEmit: true,
    },

    include: [
      dirs.root.client.join('**/*.ts').relative.to(outputDir).normalize().dir,
      dirs.root.client.join('**/*.tsx').relative.to(outputDir).normalize().dir,
      dirs.root.client.join('**/*.vue').relative.to(outputDir).normalize().dir,
      dirs.root.client.join('**/*.d.ts').relative.to(outputDir).normalize().dir,
    ],
  };

  _.merge(tsconfig, merge);

  name = name ? `client.${name}` : 'client';

  return writeTsconfig(config, tsconfig, { name });
}
