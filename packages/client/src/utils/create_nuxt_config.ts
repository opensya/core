import { atomicWriteFile, normalizeDir } from '@core/utils';
import { generateCode, parseModule, builders } from 'magicast';
import { join, relative, resolve } from 'node:path';
import { DefineNuxtConfig } from 'nuxt/schema';

type options = Parameters<DefineNuxtConfig>[0];

export function createNuxtConfig({
  modules = [],
}: { modules?: options['modules'] } = {}) {
  const buildDir = join(_outputDir, '.nuxt');
  const srcDir = join(process.cwd(), 'client');

  const mod = parseModule('');

  const dfdf: Parameters<DefineNuxtConfig>[0] = {
    srcDir: normalizeDir(relative(_outputDir, srcDir)),
    buildDir: normalizeDir(relative(_outputDir, buildDir)),
    appDir: './',

    ssr: false,
    compatibilityDate: '2026-06-18',
    devtools: { enabled: true },

    modules,

    components: [{ path: '~/components/globals', global: true, prefix: 'o' }],

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    nitro: {
      output: {
        dir: normalizeDir(relative(_outputDir, buildDir)),
      },
    },
  };

  mod.exports.default = builders.functionCall('defineNuxtConfig', dfdf);

  const { code } = generateCode(mod);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  atomicWriteFile(resolve(_outputDir, 'nuxt.config.ts'), code);
}
