import Fastify from "fastify";

import { api } from "./plugins/api/index";
import { vite } from "./plugins/vite/index.js";
import { loadOpensyaConfigs } from "./config/index.js";

async function createApp() {
  const app = Fastify({
    logger: { transport: { target: "@fastify/one-line-logger" } },
  });

  await app.register(api);
  await app.register(vite);

  return app;
}

const bootstrap = async () => {
  await loadOpensyaConfigs();

  const app = await createApp();
  try {
    await app.listen({ port: 3000 });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

bootstrap();
