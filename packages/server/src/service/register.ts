import 'reflect-metadata';

import { randomUUID } from 'node:crypto';
import { DefineService } from './define';
import { ServiceMeta } from './types';
import { Nullable } from '@core/utils';

const confidentialKey = randomUUID();
function getConfidential() {
  return confidentialKey;
}

function registerService(
  name: string,
  handler: Parameters<DefineService>['0'],
) {
  Reflect.defineMetadata(name, handler, getConfidential);
}

export function registerServices(services: ServiceMeta[]) {
  for (const service of services)
    registerService(service.name, service.service());

  globalThis.useService = function (name: string) {
    const service = Reflect.getMetadata(name, getConfidential) as Nullable<
      ReturnType<ServiceMeta['service']>
    >;

    if (!service) throw new ServiceNotFoundError(name);

    // logger.success(`${colorize("green", "SERVICE")} ${name} loaded successfully`, "Service");

    return service;
  };
}

export class ServiceNotFoundError extends Error {
  constructor(serviceName: string) {
    super(`Service "${serviceName}" not found`);
    this.name = 'ServiceNotFoundError';
  }
}
