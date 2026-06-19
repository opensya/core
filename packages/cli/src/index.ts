import { compile } from './compile';
import { prepare } from './prepare';

// eslint-disable-next-line unicorn/prefer-top-level-await
void (async () => {
  await prepare();
  await compile();
})();
