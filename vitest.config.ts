import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,

    alias: {
      '@core': resolve(__dirname, './core'),
      '@nest': resolve(__dirname, './core/nest'),
    },
  },

  test: {
    globals: true,
    environment: 'node',

    setupFiles: ['./test/setup.ts'],

    include: ['./core/**/*.test.ts'],

    exclude: ['./dist', './node_modules'],

    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: './coverage',
    },

    typecheck: {
      tsconfig: './tsconfig.vitest.json',
    },

    restoreMocks: true,
    clearMocks: true,
    mockReset: true,
  },
});
