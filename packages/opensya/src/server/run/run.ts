import Fastify, { type FastifyInstance } from "fastify";
import { restartable } from "@fastify/restartable";
import { viteDevPlugin } from "./vite_dev";
import { registerControllers } from "../controller";
import { registerServices } from "../service";
import { registerDatabase } from "../database";
import { runPrepare } from "./prepare";
import { errorHandler } from "../error";

async function createApp(
  factory: typeof Fastify,
  opts: Record<string, unknown>,
) {
  const app = factory(opts);

  await registerDatabase();
  await registerServices();
  await registerControllers(app);

  app.setErrorHandler(errorHandler);

  await app.register(viteDevPlugin);

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
    const address = await app.listen({ port });

    app.log.info(`Server listening at ${address}`);
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
