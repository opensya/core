import { FastifyInstance } from 'fastify';
import { DefineControllerMeta } from './define';

export async function registerControllers(
  app: FastifyInstance,
  controllers: DefineControllerMeta[],
) {
  for (const controller of controllers) {
    await app.register((app) => controller.route(app));
  }
}
