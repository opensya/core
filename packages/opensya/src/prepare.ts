import { ensureOutput, setCoreDir } from './utils';
import { copyOutput } from './vite/copy_output';
import * as server from './server';
import * as client from './client';

export async function prepare() {
  ensureOutput();
  copyOutput();
  await setCoreDir();

  client.prepare();
  server.prepare();
}
