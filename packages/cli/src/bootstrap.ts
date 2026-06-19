import Fastify from 'fastify';
import FastifyVite from '@fastify/vite';

import { defineGlobals } from './server/utils';
import { registerControllers } from './server/controller';
import { OUTPUT_DIR } from './utils';
import { registerServices } from './server/service';

export async function bootstrap() {
  defineGlobals();

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
    root: OUTPUT_DIR,
    // spa: true,
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
