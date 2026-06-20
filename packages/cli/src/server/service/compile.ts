import { ServiceMeta } from './define';
import { REGEXS } from '../utils';
import { join, relative } from 'node:path';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { atomicWriteFile, getChildren } from '@core/utils';
import { resolveServiceFromFilePath } from './resolve_service';
import { getDirs, runBootstrap } from '../../utils';
import { writeType } from './typing';
import chokidar from 'chokidar';

export function compileServices() {
  const dirs = getDirs();

  const servicesDir = join(dirs.INPUT_DIR_SERVER, 'services');

  const manifestDir = join(dirs.OUTPUT_DIR_SERVER, 'services.json');
  rmSync(manifestDir, { force: true });

  detectServices(servicesDir);
  listen(servicesDir);
}

function listen(servicesDir: string) {
  if (!process.argv.includes('--dev')) return;
  if (!existsSync(servicesDir)) return;

  chokidar
    .watch(servicesDir, {
      ignoreInitial: true,
      ignored: (path, stats) => {
        if (!stats?.isFile()) return false;

        const isAccept = REGEXS.acceptFiles.test(path);
        return !isAccept;
      },
    })
    .on('add', () => {
      detectServices(servicesDir);
      runBootstrap();
    })
    .on('unlink', () => {
      detectServices(servicesDir);
      runBootstrap();
    })
    .on('change', () => {
      detectServices(servicesDir);
      runBootstrap();
    });
}

function detectServices(parentDir: string) {
  if (!existsSync(parentDir)) return {};

  const dirs = getDirs();

  const files = getChildren(parentDir, {
    recursive: true,
    onlyFile: true,
    endWith: REGEXS.acceptFiles,
  });

  let services: Record<string, ServiceMeta> = {};

  for (const file of files) {
    const service = resolveServiceFromFilePath(relative(parentDir, file.path));

    services[service.name] = {
      file: file.path,
      ...service,
    };
  }

  const manifestDir = join(dirs.OUTPUT_DIR_SERVER, 'services.json');

  if (existsSync(manifestDir)) {
    const _services = JSON.parse(readFileSync(manifestDir, 'utf8'));
    services = { ..._services, ...services };
  }

  atomicWriteFile(manifestDir, JSON.stringify(services, undefined, 2));
  writeTypes(services);
}

function writeTypes(services: Record<string, ServiceMeta>) {
  if (!process.argv.includes('--dev')) return;

  for (const key in services) {
    if (!Object.hasOwn(services, key)) continue;

    const service = services[key];
    writeType(service.file, service);
  }
}
