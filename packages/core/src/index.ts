import "dotenv/config";

import Fastify from "fastify";
import cors from "@fastify/cors";
import { loadOpensyaConfigs } from "./config/index.js";
import { ensureOutput, generateAllTsconfigs } from "./utils/index.js";
import { registerPlugins } from "./plugins/register.js";
import { errorHandler } from "./error/handler.js";

async function createApp() {
  const app = Fastify({
    logger: { transport: { target: "@fastify/one-line-logger" } },
    // pluginTimeout: 30000,
  });

  await app.register(cors, {
    origin: (origin, cb) => cb(null, origin ?? true),
    credentials: true,
    methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
  });

  app.setErrorHandler(errorHandler);

  await registerPlugins(app);

  return app;
}

const bootstrap = async () => {
  await loadOpensyaConfigs();
  ensureOutput();
  generateAllTsconfigs();

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
