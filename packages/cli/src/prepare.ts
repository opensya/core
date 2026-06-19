import { copyOutput, ensureOutput, setCoreDir } from './utils';
import * as server from './server';
import * as client from './client';

export async function prepare() {
  ensureOutput();
  copyOutput();
  await setCoreDir();

  client.prepare();
  server.prepare();
}
