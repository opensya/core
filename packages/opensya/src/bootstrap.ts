import Fastify from 'fastify';
import FastifyVite from '@fastify/vite';

import { runInit } from './utils';
import { registerControllers } from './server/controller';
import { registerServices } from './server/service';
import { getDirs } from './utils';

export async function bootstrap() {
  await runInit();

  const dirs = getDirs();

  const app = Fastify({
    logger: {
      transport: {
        target: '@fastify/one-line-logger',
      },
    },
  });

  await registerServices();
  await registerControllers(app);

  await app.register(FastifyVite, {
    root: dirs.OUTPUT_DIR,
    spa: true,
    // renderer: '@fastify/react',
  });

  app.get('*', (req, reply) => {
    return reply.html();
  });

  app.setErrorHandler((error, req, reply) => {
    console.error(error);
    reply.send({ error });
  });

  await app.vite.ready();

  app.decorate('db', {
    todoList: ['Do laundry', 'Respond to emails', 'Write report'],
  });

  await app.listen({ port: 3000 });
}
