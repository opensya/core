import Fastify, { type FastifyInstance } from "fastify";
import { restartable } from "@fastify/restartable";
import { registerControllers } from "../controller";
import { registerServices } from "../service";
import { registerDatabase } from "../database";
import { runPrepare } from "./prepare";
import { errorHandler } from "../error";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";

import plugins from "../plugins/in_plugibs";
import { registerPlugins } from "../plugins";

async function createApp(
  factory: typeof Fastify,
  opts: Record<string, unknown>,
) {
  const app = factory(opts);

  await registerDatabase();
  await registerServices();

  app.register(cors, {
    origin: (origin, cb) => cb(null, origin ?? true),
    credentials: true,
    methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
  });

  app.setErrorHandler(errorHandler);

  await app.register(cookie, { secret: process.env.SECRET_KEY });

  for (const plugin of plugins) await app.register(plugin);

  await registerPlugins(app);

  await registerControllers(app);

  return app;
}

let app: FastifyInstance;

export async function runServer() {
  try {
    await runPrepare();

    app = await restartable(createApp, {
      logger: { transport: { target: "@fastify/one-line-logger" } },
    });

    app.addPreRestartHook(async () => {
      app.log.info("Restarting application...");
    });

    app.addOnRestartHook(async (newApp) => {
      newApp.log.info("Application restarted successfully");
    });

    const port = parseInt(process.env.PORT ?? "3000");
    await app.listen({ port });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

export async function runServer0() {
  try {
    await runPrepare();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

export async function restartServer(): Promise<void> {
  if (!app) {
    throw new Error("Server not initialized");
  }

  await app.restart();
}
