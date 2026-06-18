import { relative } from 'node:path';
import type {
  FastifyInstance,
  FastifyRequest,
  RouteGenericInterface,
} from 'fastify';
import type { ControllerContext, ControllerOptions } from './types';
import type { MayBePromise } from '@core/utils';
import { resolveRouteFromFilePath } from './resolve_route';

export interface DefinedController {
  route(app: FastifyInstance): void;
  init(filePath: string, parentDir: string): ControllerOptions;
}

export function defineController<
  T extends RouteGenericInterface = RouteGenericInterface,
  R = unknown,
>(
  handler: (context: ControllerContext<T>) => MayBePromise<R>,
  options: ControllerOptions = {},
): DefinedController {
  return {
    route: (app) => {
      app.route({
        method: options.method ?? 'GET',
        url: options.path ?? '/',
        handler: async (req, res) => {
          return handler({
            req: req as FastifyRequest<T>,
            res,
          });
        },
      });
    },

    init(filePath: string, parentDir: string) {
      const segment = relative(parentDir, filePath);
      const { path, method } = resolveRouteFromFilePath(segment);

      options.path ??= path;
      options.method ??= method;

      return options;
    },
  };
}

export type DefineController = typeof defineController;
export type DefineControllerMeta = DefinedController & { filePath: string };

declare global {
  var defineController: DefineController;
}
