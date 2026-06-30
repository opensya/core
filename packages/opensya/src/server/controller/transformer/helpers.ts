import type { RouteOptions, preHandlerHookHandler } from "fastify";
import type { MayBePromise } from "@opensya/utils";

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

export type RouteTransformer = (
  options: RouteOptions,
) => MayBePromise<RouteOptions>;

export type RouteTransformerMeta = {
  name: string;
  file: string;
  global?: boolean;
};

export type RouteTransformerGlobalHandler = () => RouteTransformer;
