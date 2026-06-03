import * as server from '../nest/run';
import * as client from '../nuxt/run';

async function prepare() {
  await server.runPrepare();
  await client.runPrepare();
}

void prepare();
