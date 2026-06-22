import Fastify from "fastify";
import { viteDevPlugin } from "./vite_dev";
import { registerControllers } from "../controller";
import { registerServices } from "../service";
import { registerDatabase } from "../database";
import { runPrepare } from "./prepare";

export async function runServer() {
  await runPrepare();

  const app = Fastify({
    logger: {
      transport: { target: "@fastify/one-line-logger" },
    },
  });

  await registerDatabase();
  await registerServices();
  await registerControllers(app);

  await app.register(viteDevPlugin);

  app.setErrorHandler((error, req, reply) => {
    console.error(error);
    reply.send({ error });
  });

  const port = parseInt(process.env.PORT ?? "3000");
  await app.listen({ port });
}
