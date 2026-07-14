import fp from "fastify-plugin";
import type {
  FastifyPluginCallback,
  preHandlerHookHandler,
  RouteHandlerMethod,
  RouteOptions,
} from "fastify";
import type { ApiMetaOptions } from "../resolve.js";
import {
  composeRouteMiddlewares,
  type RouteMiddlewareDefinition,
} from "./middleware.js";

export type RouteTransformer = (
  options: RouteOptions,
) => RouteOptions | Promise<RouteOptions>;

export type ApiHandlerOptions = Omit<
  RouteOptions,
  "method" | "url" | "handler"
>;

type PluginParams = ApiMetaOptions & {
  middlewares: RouteMiddlewareDefinition[];
};

export function defineRouteHandler<THandler extends RouteHandlerMethod>(
  handler: THandler,
  ...transformers: RouteTransformer[]
): FastifyPluginCallback<ApiMetaOptions>;

export function defineRouteHandler<
  THandler extends RouteHandlerMethod,
  TOptions extends ApiHandlerOptions,
>(
  handler: THandler,
  options: TOptions,
  ...transformers: RouteTransformer[]
): FastifyPluginCallback<ApiMetaOptions>;

export function defineRouteHandler<
  THandler extends RouteHandlerMethod,
  TOptions extends ApiHandlerOptions = ApiHandlerOptions,
>(
  handler: THandler,
  optionsOrTransformer?: TOptions | RouteTransformer,
  ...transformers: RouteTransformer[]
): FastifyPluginCallback<PluginParams> {
  const hasOptions =
    typeof optionsOrTransformer === "object" && optionsOrTransformer !== null;

  const args = {
    handler,
    options: hasOptions ? optionsOrTransformer : ({} as TOptions),
    transformers: hasOptions
      ? transformers
      : optionsOrTransformer
        ? [optionsOrTransformer, ...transformers]
        : transformers,
  };

  return fp<PluginParams>(async (app, options) => {
    const handler = composeRouteMiddlewares(options.middlewares, args.handler);

    let routeOptions: RouteOptions = {
      url: options.url,
      method: options.method,
      config: args.options.config,
      handler,
    };

    for (const transformer of args.transformers) {
      routeOptions = await transformer(routeOptions);
    }

    app.route(routeOptions);
  });
}

export function appendPreHandler(
  options: RouteOptions,
  hook: preHandlerHookHandler,
) {
  if (!options.preHandler) {
    options.preHandler = [hook];
  } else if (Array.isArray(options.preHandler)) {
    options.preHandler.push(hook);
  } else {
    options.preHandler = [options.preHandler, hook];
  }

  return options;
}
