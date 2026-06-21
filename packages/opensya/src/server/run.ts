import Fastify from "fastify";
import { init, writeTsconfig } from "../utils";
import { viteDevPlugin } from "./vite_dev";
import { defineGlobals } from "./utils";
import { compileControllers, registerControllers } from "./controller";
import { compileServices, registerServices } from "./service";

export async function runServer() {
  await init();

  defineGlobals();
  compileServices();
  compileControllers();

  writeTsconfig();

  const app = Fastify({
    logger: {
      transport: { target: "@fastify/one-line-logger" },
    },
  });

  app.get("/api/hello", async () => {
    return { message: "Hello from Fastify" };
  });

  await registerServices();
  await registerControllers(app);
  await app.register(viteDevPlugin);

  app.setErrorHandler((error, req, reply) => {
    console.error(error);
    reply.send({ error });
  });

  await app.listen({ port: 3000 });
}
