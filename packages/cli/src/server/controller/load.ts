import { HTTPMethods } from 'fastify';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { OUTPUT_DIR_SERVER } from '../../utils';
import { DefineControllerMeta } from './define';

export async function loadControllers() {
  type Raw = {
    content: { default?: DefineControllerMeta };

    _meta: {
      file: string;
      path: string;
      method: HTTPMethods;
    };
  };

  const controllers = JSON.parse(
    readFileSync(join(OUTPUT_DIR_SERVER, 'controllers.json'), 'utf8'),
  ) as Record<string, Raw['_meta']>;

  const raws: Raw[] = [];

  for (const key in controllers) {
    if (!Object.hasOwn(controllers, key)) continue;

    const controller = controllers[key];
    const href = pathToFileURL(controller.file).href;
    const content = (await import(href)) as Raw['content'];

    raws.push({ content, _meta: controller });
  }

  return raws;
}
