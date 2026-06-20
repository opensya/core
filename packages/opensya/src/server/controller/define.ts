import type {
  FastifyInstance,
  FastifyRequest,
  HTTPMethods,
  RouteGenericInterface,
} from 'fastify';
import type { ControllerContext, ControllerOptions } from './types';
import type { MayBePromise } from '@opensya/utils';

export interface ControllerMeta {
  file: string;
  path: string;
  method: HTTPMethods;
}

export interface DefinedController {
  route(
    app: FastifyInstance,
    meta: { file: string; path: string; method: HTTPMethods },
  ): void;
}

export function defineController<
  T extends RouteGenericInterface = RouteGenericInterface,
  R = unknown,
>(
  handler: (context: ControllerContext<T>) => MayBePromise<R>,
  options: ControllerOptions = {},
): DefinedController {
  return {
    route: (app, meta) => {
      app.route({
        method: meta.method,
        url: meta.path,

        handler: async (req, res) => {
          return handler({
            req: req as FastifyRequest<T>,
            res,
          });
        },
      });
    },
  };
}

export type DefineController = typeof defineController;
export type DefineControllerMeta = DefinedController;

declare global {
  var defineController: DefineController;
}
