import type { FastifyInstance, HTTPMethods } from "fastify";
import type { ControllerContext, ControllerOptions } from "./types";
import type { MayBePromise } from "@opensya/utils";

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

export type DefineController = <R = unknown>(
  handler: (context: ControllerContext) => MayBePromise<R>,
  options?: ControllerOptions,
) => DefinedController;

export const defineController: DefineController = (handler, options = {}) => {
  return {
    route: (app, meta) => {
      app.route({
        method: meta.method,
        url: meta.path,

        handler: async (req, res) => {
          console.log(options);

          return handler({
            req: req,
            res,
          });
        },
      });
    },
  };
};

export type DefineControllerMeta = DefinedController;
