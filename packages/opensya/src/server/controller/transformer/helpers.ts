import type { RouteOptions, preHandlerHookHandler } from "fastify";

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
