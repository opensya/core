import { join } from 'node:path';
import { x } from 'tinyexec';
import { compile } from './compile';
import { prepare } from './prepare';
import { OUTPUT_DIR, runBootstrap } from './utils';

// eslint-disable-next-line unicorn/prefer-top-level-await
void (async () => {
  await prepare();
  await compile();

  runBootstrap();
})();
