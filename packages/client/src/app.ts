// import { xSync } from 'tinyexec';

// export function buildApp() {
//   ensureOutput();
//   createNuxtConfig();
//   createAppVue();

//   const command = 'nuxt';
//   const args = ['prepare', `--cwd=${_outputDir}`];

//   xSync(command, args, { nodeOptions: { stdio: 'inherit' } });
// }

import { ensureOutput, initFramework } from './utils';

export function buildApp() {
  ensureOutput();
  initFramework();
}
