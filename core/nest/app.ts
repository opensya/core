import { Module, ModuleMetadata, OnApplicationBootstrap } from '@nestjs/common';
import { APP_GUARD, NestFactory } from '@nestjs/core';
import { colorize } from 'consola/utils';
import { getAddressURL } from './utils/server';
import { initDatabase } from './utils/database';
import { initServices } from './utils/services';
import { NestLogger } from './utils/nest';
import { createI18n } from './utils/i18n/i18n';
import { Guard } from './utils/guards/register';

export async function createApp() {
  const port = process.env.NEST_PORT ?? 3e3;
  const modules: ModuleMetadata = { ..._nestConfig.modules };
  modules.imports ??= [];
  modules.providers ??= [];
  modules.exports ??= [];
  modules.controllers ??= [];

  modules.providers.push(NestLogger);
  modules.exports.push(NestLogger);

  modules.providers.push({ provide: APP_GUARD, useClass: Guard });

  const controllers = Object.values(_nestConfig.controllers);
  modules.controllers = controllers;

  @Module(modules)
  class AppModule implements OnApplicationBootstrap {
    async onApplicationBootstrap() {
      await initDatabase();
      await createI18n();
      void initServices();

      for (const onBootstrap of _nestConfig.onBootstraps) {
        await onBootstrap();
      }
    }
  }

  globalThis._nestApp = await NestFactory.create(AppModule, {
    bufferLogs: true,
    ..._nestConfig.options,
  });

  _nestApp.useLogger(_nestApp.get(NestLogger));

  _nestApp.setGlobalPrefix('api');

  console.log();

  if (process.env.PREPARE_MODE !== 'yes') {
    void _nestApp?.listen(port, () => void onAppListen());
  }
}

async function onAppListen() {
  if (!_nestApp) return;

  const host = await getAddressURL();

  globalThis.BASE_URL = host;
  globalThis.API_BASE_URL = host;

  logger.log();

  logger.log(
    [
      ''.padStart(1, ' '),
      colorize('greenBright', '➜ Local'.padEnd(11, ' ')),
      colorize('underline', colorize('blueBright', host)),
    ].join(' '),
  );

  logger.log(
    [
      ''.padStart(1, '  '),
      colorize('dim', '➜ Network'.padEnd(11, ' ')),
      colorize('dim', 'use'),
      colorize('reset', '--host'),
      colorize('dim', 'to expose'),
    ].join(' '),
  );

  logger.log(' ');

  process.send?.({ type: 'server:started' });
}
