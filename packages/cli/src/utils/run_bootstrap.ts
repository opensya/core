import { join } from 'node:path';
import { OUTPUT_DIR } from './output';
import { Result, x } from 'tinyexec';

const state: { process?: Result } = {};

export function runBootstrap() {
  if (!process.argv.includes('--dev')) return;

  const command = 'tsx';
  const args: string[] = [join(OUTPUT_DIR, 'server.js'), '--dev'];

  if (state.process && !state.process.killed) {
    state.process.kill();
    console.log('restarting server ...');
  }

  state.process = x(command, args, { nodeOptions: { stdio: 'inherit' } });
}
