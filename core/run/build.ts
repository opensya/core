import * as server from '../nest/run/build';
import * as client from '../nuxt/run/build';

async function build() {
  console.clear();

  await server.runBuild();
  await client.runBuild();
}

void build();
