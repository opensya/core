import { xSync } from 'tinyexec';
import { createAppVue, createNuxtConfig, ensureOutput } from './utils';

export function buildApp() {
  ensureOutput();
  createNuxtConfig();
  createAppVue();

  const command = 'nuxt';
  const args = ['prepare', `--cwd=${_outputDir}`];

  xSync(command, args, { nodeOptions: { stdio: 'inherit' } });
}
