import "dotenv/config";

import Fastify from "fastify";

import { database } from "./plugins/database/index.js";
import { api } from "./plugins/api/index.js";
import { vite } from "./plugins/vite/index.js";
import { loadOpensyaConfigs } from "./config/index.js";
import { ensureOutput, generateTsconfig } from "./utils/index.js";

async function createApp() {
  const app = Fastify({
    logger: { transport: { target: "@fastify/one-line-logger" } },
  });

  await app.register(database);
  await app.register(api);
  await app.register(vite);

  return app;
}

const bootstrap = async () => {
  await loadOpensyaConfigs();
  ensureOutput();
  generateTsconfig();

  const app = await createApp();
  try {
    const port = process.env.PORT;
    await app.listen({ port: parseInt(port ?? "3000") });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

bootstrap();
