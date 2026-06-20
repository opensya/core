import { runBootstrap, runInit } from './utils';
import { prepare } from './prepare';
import { compile } from './compile';

await runInit();
await prepare();
await compile();

runBootstrap();
