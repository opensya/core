import { randomUUID } from 'crypto';
import { DefineService } from '#core/nest/types';
import { colorize } from 'consola/utils';

const confidentialKey = randomUUID();
function getConfidential() {
  return confidentialKey;
}

export function registerService(
  name: string,
  handler: Parameters<DefineService>['0'],
) {
  Reflect.defineMetadata(name, handler, getConfidential);
  logger.success(`Service ${colorize('green', name)} registred`, 'Service');
}

export function initServices() {
  globalThis.useService = function (name: string) {
    const service = Reflect.getMetadata(name, getConfidential);

    return service;
  };

  globalThis.useService = function (name: string) {
    const service = Reflect.getMetadata(name, getConfidential);

    if (!service) throw new ServiceNotFoundError(name);

    logger.success(
      `${colorize('green', 'SERVICE')} ${name} loaded successfully`,
      'Service',
    );

    return service;
  };
}

export class ServiceNotFoundError extends Error {
  constructor(serviceName: string) {
    super(`Service "${serviceName}" not found`);
    this.name = 'ServiceNotFoundError';
  }
}
