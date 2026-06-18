export * from './types';
export * from './define';
export * from './register';

import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { defineController, DefineControllerMeta } from './define';
import { pathToFileURL } from 'node:url';
import { getChildren } from '../utils/get_children';
import { REGEX } from '../utils';

export async function initControllers() {
  globalThis.defineController = defineController;

  const controllersDir = join(process.cwd(), 'server/controllers');
  const controllers = await getControllers(controllersDir);

  return { controllers };
}

async function getControllers(parentDir: string) {
  if (!existsSync(parentDir)) return [];

  const files = getChildren(parentDir, {
    recursive: true,
    onlyFile: true,
    endWith: REGEX.acceptFiles,
  });

  const controllers: DefineControllerMeta[] = [];

  for (const file of files) {
    const module = (await import(pathToFileURL(file.path).href)) as {
      default?: DefineControllerMeta;
    };
    const controller = module.default;

    if (!controller) continue;

    controller.filePath = file.path;
    controllers.push(controller);
  }

  for (const controller of controllers)
    controller.init(controller.filePath, parentDir);

  return controllers.filter(Boolean);
}
