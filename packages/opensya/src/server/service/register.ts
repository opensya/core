import 'reflect-metadata';

import { randomUUID } from 'node:crypto';
import { DefinedService } from './define';
import { loadServices } from './load';

const confidentialKey = randomUUID();
function getConfidential() {
  return confidentialKey;
}

function registerService(name: string, handler: DefinedService['service']) {
  Reflect.defineMetadata(name, handler, getConfidential);
}

export async function registerServices() {
  const services = await loadServices();

  for (const service of services) {
    if (!service.content.default) continue;

    registerService(service._meta.name, service.content.default.service);
  }

  globalThis.useService = function (name: string) {
    const service = Reflect.getMetadata(name, getConfidential);

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
