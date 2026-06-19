import * as server from './server';
import * as client from './client';

export async function compile() {
  await client.compile();
  server.compile();
}
