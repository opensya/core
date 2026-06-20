/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { join } from 'node:path';
import { CORE_DIR, OUTPUT_DIR } from './meta.js';

const { createOpensyaViteConfig } = await import(join(CORE_DIR, 'vite/config'));
const { CLIENT_DIRNAME } = await import(CORE_DIR);

export default createOpensyaViteConfig({
  coreDir: CORE_DIR,
  outputDir: OUTPUT_DIR,
  root: join(OUTPUT_DIR, CLIENT_DIRNAME),
});
