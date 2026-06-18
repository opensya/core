import Fastify from 'fastify';
import { initControllers } from './controller';
import { initService } from './service';
import { ensureOutput, writeTsconfig } from './utils';

export const buildApp = async () => {
  ensureOutput();

  const app = Fastify({ logger: true });

  const { controllers } = await initControllers();
  const { services } = await initService();

  writeTsconfig();

  return { app, controllers, services };
};
