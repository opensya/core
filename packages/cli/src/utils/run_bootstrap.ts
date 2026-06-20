import { join } from 'node:path';
import { Result, x } from 'tinyexec';
import { getDirs } from './dirs';

const state: { process?: Result } = {};

export function runBootstrap() {
  if (!process.argv.includes('--dev')) return;

  const dirs = getDirs();

  const command = 'tsx';
  const args: string[] = [join(dirs.OUTPUT_DIR, 'server.js'), '--dev'];

  if (state.process && !state.process.killed) {
    state.process.kill();
    console.log('restarting server ...');
  }

  state.process = x(command, args, { nodeOptions: { stdio: 'inherit' } });
}
