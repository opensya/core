import { defineConfig } from '@rslib/core';

export default defineConfig({
  source: {
    tsconfigPath: './tsconfig.build.json',
    entry: {
      index: [
        './core/nuxt/**/*.ts',
        '!./core/nuxt/**/*.spec.ts',
        '!./core/nuxt/**/*.test.ts',
        '!./core/nuxt/**/__tests__/**',
      ],
    },
  },

  lib: [
    {
      dts: false,
      bundle: false,
      format: 'esm',
    },
  ],

  output: {
    target: 'node',
    cleanDistPath: false,
    distPath: { root: './dist' },
    filename: { js: 'core/nuxt/[name].js' },
  },

  tools: {
    rspack: {
      context: process.cwd(),
    },
  },
});
