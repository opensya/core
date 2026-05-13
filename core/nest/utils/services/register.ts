import { randomUUID } from 'crypto';
import { DefineService } from '@nest/types';

const confidentialKey = randomUUID();
function getConfidential() {
  return confidentialKey;
}

export function registerService(
  name: string,
  handler: Parameters<DefineService>['0'],
) {
  Reflect.defineMetadata(name, handler, getConfidential);
}

export function initServices() {
  globalThis.useService = function (name: string) {
    const service = Reflect.getMetadata(
      name,
      getConfidential,
    ) as Parameters<DefineService>['0'];

    return service;
  };
}
