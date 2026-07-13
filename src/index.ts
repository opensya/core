import "dotenv/config";

import Fastify from "fastify";
import { loadOpensyaConfigs } from "./config/index.js";
import { ensureOutput, generateTsconfig } from "./utils/index.js";
import { registerPlugins } from "./plugins/register.js";

async function createApp() {
  const app = Fastify({
    logger: { transport: { target: "@fastify/one-line-logger" } },
  });

  await registerPlugins(app);

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
