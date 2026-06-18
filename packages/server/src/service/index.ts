export * from './define';
export * from './types';
export * from './register';

import { defineSerice } from './define';
import { getChildren, REGEX } from '../utils';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { ServiceMeta } from './types';
import { Nullable } from '@core/utils';

export async function initService() {
  globalThis.defineSerice = defineSerice;

  const servicesDir = join(process.cwd(), 'server/services');
  const services = await getServices(servicesDir);

  return { services };
}

async function getServices(parentDir: string) {
  if (!existsSync(parentDir)) return [];

  const files = getChildren(parentDir, {
    recursive: true,
    onlyFile: true,
    endWith: REGEX.acceptFiles,
  });

  const services: ServiceMeta[] = [];

  for (const file of files) {
    const module = await import(pathToFileURL(file.path).href);
    const service = module.default as Nullable<ServiceMeta>;

    if (!service) continue;

    service.filePath = file.path;
    services.push(service);
  }

  for (let i = 0; i < services.length; i++) {
    const service = services[i];
    const options = services[i].init(service.filePath, parentDir);

    services[i].name = options.name;
  }

  return services.filter(Boolean);
}
