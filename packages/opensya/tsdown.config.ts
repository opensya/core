import { cpSync } from 'node:fs';
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/run.ts', 'src/vite/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  unbundle: true,

  external: [/^\/?\$(core|output):/],

  outExtensions: (ctx) => {
    return {
      js: ctx.format === 'cjs' ? '.cjs' : '.js',
    };
  },

  onSuccess() {
    cpSync('./src/vite/output', './dist/vite/output', {
      recursive: true,
      force: true,
    });
  },
});
