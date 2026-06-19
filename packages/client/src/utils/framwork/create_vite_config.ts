import { atomicWriteFile } from '@core/utils';
import { resolve } from 'node:path';

import { addVitePlugin } from 'magicast/helpers';
import { generateCode, parseModule, builders } from 'magicast';

export function createViteConfig() {
  const mod = parseModule('');

  mod.imports.$add({ imported: 'defineConfig', from: 'vite' });

  mod.exports.default = builders.functionCall('defineConfig', {});

  addVitePlugin(mod, {
    from: '@vitejs/plugin-react',
    constructor: 'react',
  });

  const { code } = generateCode(mod);

  atomicWriteFile(resolve(_outputDir, 'vite.config.js'), code);
}
