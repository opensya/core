import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { REGEXS } from '../utils';
import { atomicWriteFile, getChildren } from '@core/utils';
import { INPUT_DIR_SERVER, OUTPUT_DIR_SERVER } from '../../utils';
import { resolveRouteFromFilePath } from './resolve_route';
import { HTTPMethods } from 'fastify';

export function compileControllers() {
  const controllersDir = join(INPUT_DIR_SERVER, 'controllers');
  const controllers = detectControllers(controllersDir);

  atomicWriteFile(
    join(OUTPUT_DIR_SERVER, 'controllers.json'),
    JSON.stringify(controllers, undefined, 2),
  );
}

function detectControllers(parentDir: string) {
  if (!existsSync(parentDir)) return {};

  const files = getChildren(parentDir, {
    recursive: true,
    onlyFile: true,
    endWith: REGEXS.acceptFiles,
  });

  const controllers: Record<
    string,
    {
      file: string;
      path: string;
      method: HTTPMethods;
    }
  > = {};

  for (const file of files) {
    const route = resolveRouteFromFilePath(file.path);

    const idx = `${route.path}:${route.method}`;
    controllers[idx] = { file: file.path, ...route };
  }

  return controllers;
}
