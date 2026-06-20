import { FastifyInstance } from 'fastify';
import { loadControllers } from './load';

export async function registerControllers(app: FastifyInstance) {
  const controllers = await loadControllers();

  for (const controller of controllers) {
    if (!controller.content.default) continue;

    controller.content.default.route(app, controller._meta);
  }
}
