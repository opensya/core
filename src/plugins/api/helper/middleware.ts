import type { FastifyReply, FastifyRequest, RouteHandlerMethod } from "fastify";

export type RouteMiddlewareNext<TResult = unknown> = () => Promise<TResult>;

export type RouteMiddlewareHandler<TResult = unknown> = (
  request: FastifyRequest,
  reply: FastifyReply,
  next: RouteMiddlewareNext<TResult>,
) => TResult | Promise<TResult>;

export interface RouteMiddlewareOptions<TResult = unknown> {
  pre?: (request: FastifyRequest, reply: FastifyReply) => void | Promise<void>;

  post?: (
    request: FastifyRequest,
    reply: FastifyReply,
    result: TResult,
  ) => void | Promise<void>;
}

export interface RouteMiddlewareDefinition<TResult = unknown> {
  handler: RouteMiddlewareHandler<TResult>;
}

export function defineRouteMiddleware<TResult = unknown>(
  middleware: RouteMiddlewareHandler<TResult> | RouteMiddlewareOptions<TResult>,
): RouteMiddlewareDefinition<TResult> {
  if (typeof middleware === "function") {
    return {
      handler: middleware,
    };
  }

  return {
    handler: async (request, reply, next) => {
      await middleware.pre?.(request, reply);

      const result = await next();

      await middleware.post?.(request, reply, result);

      return result;
    },
  };
}

export function composeRouteMiddlewares<TResult = unknown>(
  middlewares: RouteMiddlewareDefinition<TResult>[],
  routeHandler: RouteHandlerMethod,
): RouteHandlerMethod {
  return async function composedRouteHandler(request, reply) {
    let currentIndex = -1;

    const dispatch = async (index: number): Promise<TResult> => {
      if (index <= currentIndex) {
        throw new Error("next() cannot be called multiple times");
      }

      currentIndex = index;

      const middleware = middlewares[index];

      if (middleware) {
        return middleware.handler(request, reply, () => dispatch(index + 1));
      }

      return routeHandler.call(this, request, reply) as Promise<TResult>;
    };

    return dispatch(0);
  };
}
