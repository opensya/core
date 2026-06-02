import { defineConfig } from '@rslib/core';
import { globSync } from 'glob';
import { dirname, relative, resolve } from 'node:path';
import ts from 'typescript';

const tsconfigPath = process.env.RSLIB_TSCONFIG;

if (!tsconfigPath) {
  throw new Error('Missing RSLIB_TSCONFIG env');
}

const tsconfigAbsolutePath = resolve(tsconfigPath);
const tsconfigDir = dirname(tsconfigAbsolutePath);

// eslint-disable-next-line @typescript-eslint/unbound-method
const readResult = ts.readConfigFile(tsconfigAbsolutePath, ts.sys.readFile);

if (readResult.error) {
  throw new Error(
    ts.flattenDiagnosticMessageText(readResult.error.messageText, '\n'),
  );
}

const tsconfig = readResult.config;

const rootDir = resolve(
  tsconfigDir,
  tsconfig.compilerOptions?.rootDir ?? '../server',
);

const outDir = resolve(
  tsconfigDir,
  tsconfig.compilerOptions?.outDir ?? '../dist/server',
);

function getEntries() {
  const files = globSync('**/*.ts', {
    cwd: rootDir,
    absolute: true,
    ignore: ['**/*.d.ts', '**/*.spec.ts', '**/*.test.ts'],
  });

  if (!files.length) {
    throw new Error(`No server entry files found in ${rootDir}`);
  }

  return Object.fromEntries(
    files.map((file) => {
      const name = relative(rootDir, file)
        .replace(/\.ts$/, '')
        .replace(/\\/g, '/');

      return [name, file];
    }),
  );
}

const config = defineConfig({
  source: {
    entry: getEntries(),
    tsconfigPath: tsconfigAbsolutePath,
  },

  output: {
    target: 'node',
    cleanDistPath: true,
    filename: {
      js: '[name].js',
    },
    distPath: {
      root: outDir,
    },
    externals: [/^node:/, /^#core(\/.*)?$/, /^[a-z@][^:]*/],
  },

  lib: [
    {
      format: 'cjs',
      syntax: 'es2024',
      dts: true,
    },
  ],
});

export = config;
