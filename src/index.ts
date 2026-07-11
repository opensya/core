import Fastify from "fastify";
import { vite } from "./plugins/vite/index.js";

async function createApp() {
  const app = Fastify({
    logger: { transport: { target: "@fastify/one-line-logger" } },
  });

  app.get("/api/", function (request, reply) {
    reply.send({ hello: "world" });
  });

  await app.register(vite);

  return app;
}

const bootstrap = async () => {
  const app = await createApp();
  try {
    await app.listen({ port: 3000 });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

bootstrap();
