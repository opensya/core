import { buildApp } from './app';
import { x } from 'tinyexec';

export function bootstrap() {
  buildApp();

  const command = 'nuxt';
  const args = ['dev', `--cwd=${_outputDir}`];

  const result = x(command, args, { nodeOptions: { stdio: 'inherit' } });
}
