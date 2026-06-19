// import { xSync } from 'tinyexec';

// export function buildApp() {
//   ensureOutput();
//   createNuxtConfig();
//   createAppVue();

//   const command = 'nuxt';
//   const args = ['prepare', `--cwd=${_outputDir}`];

//   xSync(command, args, { nodeOptions: { stdio: 'inherit' } });
// }

import { ensureOutput } from './utils';
import { createViteConfig } from './utils/create_vite_config';
import { createIndexHtml } from './utils/creat_index_html';
import { createMainJsx } from './utils/create_main_jsx';

export function buildApp() {
  ensureOutput();
  createViteConfig();
  createIndexHtml();
  createMainJsx();
}
