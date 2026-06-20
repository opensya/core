import { runBootstrap, runInit } from './utils';
import { prepare } from './prepare';
import { compile } from './compile';

export async function run() {
  await runInit();
  await prepare();
  await compile();

  runBootstrap();
}

if (process.argv.includes('--dev')) await run();
