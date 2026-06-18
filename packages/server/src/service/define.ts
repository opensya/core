import { relative } from 'node:path';
import { MayBePromise } from '@core/utils';
import { resolveServiceFromFilePath } from './resolve_service';
import { writeType } from './typing';

export interface ServiceOptions {
  name: string;
}

export function defineSerice<P extends unknown[], R = unknown>(
  handler: (...arguments_: P) => MayBePromise<R>,
) {
  const options = {} as ServiceOptions;

  async function fn(...arguments_: P) {
    return await handler(...arguments_);
  }

  return {
    service: () => fn,

    init(filePath: string, parentDir: string) {
      const segment = relative(parentDir, filePath);
      const { name } = resolveServiceFromFilePath(segment);

      options.name ||= name;

      writeType(filePath, { name });

      return options;
    },
  };
}

export type DefineService = typeof defineSerice;
export type DefinedService = ReturnType<typeof defineSerice>;

declare global {
  var defineSerice: DefineService;
}
