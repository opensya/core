import { buildApp } from './app';
import { registerControllers } from './controller';
import { registerServices } from './service';

export async function bootstrap() {
  const { app, controllers, services } = await buildApp();

  registerServices(services);
  await registerControllers(app, controllers);

  await app.listen({ host: '0.0.0.0', port: 4451 });
}
