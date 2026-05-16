import { defineConfig } from '@rslib/core';

export default defineConfig({
  source: {
    tsconfigPath: './tsconfig.build.json',

    entry: {
      index: [
        './core/**/*.ts',
        '!./core/**/*.spec.ts',
        '!./core/**/*.test.ts',
        '!./core/**/__tests__/**',
      ],
    },
  },

  lib: [
    {
      dts: true,
      bundle: false,
      format: 'esm',
    },
  ],

  output: {
    target: 'node',
    cleanDistPath: true,
    distPath: { root: './dist' },
    filename: { js: 'core/[name].mjs' },
  },

  tools: {
    rspack: {
      context: process.cwd(),
    },
  },
});
