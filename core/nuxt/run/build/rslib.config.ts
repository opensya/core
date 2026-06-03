import { defineConfig } from '@rslib/core';
import { pluginVue } from '@rsbuild/plugin-vue';
import { globSync } from 'glob';
import { relative, resolve } from 'node:path';

const cwd = process.env.OPENSYA_MODULE_CWD;

if (!cwd) {
  throw new Error('Missing OPENSYA_MODULE_CWD env');
}

const clientDir = resolve(cwd, 'client');
const outDir = resolve(cwd, 'dist/client');

function getEntries() {
  const files = globSync('**/*.{ts,js,mjs,vue}', {
    cwd: clientDir,
    absolute: true,
    ignore: ['**/*.d.ts', '**/*.spec.ts', '**/*.test.ts'],
  });

  if (!files.length) {
    throw new Error(`No client module files found in ${clientDir}`);
  }

  return Object.fromEntries(
    files.map((file) => {
      const name = relative(clientDir, file)
        .replace(/\.(ts|js|mjs|vue)$/, '')
        .replace(/\\/g, '/');

      return [name, file];
    }),
  );
}

const config = defineConfig({
  source: {
    entry: getEntries(),
  },

  output: {
    target: 'web',
    cleanDistPath: true,
    distPath: {
      root: outDir,
    },
    filename: {
      js: '[name].js',
    },
    externals: [
      /^vue$/,
      /^nuxt$/,
      /^#app$/,
      /^#imports$/,
      /^@nuxt\//,
      /^@vue\//,
    ],
  },

  plugins: [pluginVue()],

  lib: [
    {
      format: 'esm',
      syntax: 'es2022',
      dts: false,
    },
  ],
});

export = config;
