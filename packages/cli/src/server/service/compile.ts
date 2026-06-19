import { defineSerice, ServiceMeta } from './define';
import { REGEXS } from '../utils';
import { join, relative } from 'node:path';
import { existsSync } from 'node:fs';
import { atomicWriteFile, getChildren } from '@core/utils';
import { resolveServiceFromFilePath } from './resolve_service';
import { INPUT_DIR_SERVER, OUTPUT_DIR_SERVER } from '../../utils';
import { writeType } from './typing';

export function compileServices() {
  globalThis.defineSerice = defineSerice;

  const servicesDir = join(INPUT_DIR_SERVER, 'services');
  const services = detectServices(servicesDir);

  atomicWriteFile(
    join(OUTPUT_DIR_SERVER, 'servces.json'),
    JSON.stringify(services, undefined, 2),
  );

  for (const key in services) {
    if (!Object.hasOwn(services, key)) continue;

    const service = services[key];
    writeType(service.file, service);
  }
}

function detectServices(parentDir: string) {
  if (!existsSync(parentDir)) return {};

  const files = getChildren(parentDir, {
    recursive: true,
    onlyFile: true,
    endWith: REGEXS.acceptFiles,
  });

  const services: Record<string, ServiceMeta> = {};

  for (const file of files) {
    const service = resolveServiceFromFilePath(relative(parentDir, file.path));

    services[service.name] = {
      file: file.path,
      ...service,
    };
  }

  return services;
}
