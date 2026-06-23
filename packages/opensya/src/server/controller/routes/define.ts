import type {
  HTTPMethods,
  RouteHandlerMethod,
  RouteOptions as FastifyRouteOptions,
} from "fastify";
import type { RouteTransformer } from "../transformer";
import { transformers } from "./transformers";

export interface RouteMeta {
  name: string;
  file: string;
  path: string;
  method: HTTPMethods;
  idx: string;
}

export type RouteOptions = Omit<
  FastifyRouteOptions,
  "method" | "url" | "handler"
>;

export type DefinedRoute<
  THandler extends RouteHandlerMethod = RouteHandlerMethod,
  TOptions extends RouteOptions = RouteOptions,
> = {
  handler: THandler;
  options: TOptions;
  transformers: RouteTransformer[];
};

export function defineRoute<THandler extends RouteHandlerMethod>(
  handler: THandler,
  ...transformers: RouteTransformer[]
): DefinedRoute<THandler, RouteOptions>;

export function defineRoute<
  THandler extends RouteHandlerMethod,
  TOptions extends RouteOptions,
>(
  handler: THandler,
  options: TOptions,
  ...transformers: RouteTransformer[]
): DefinedRoute<THandler, TOptions>;

export function defineRoute<
  THandler extends RouteHandlerMethod,
  TOptions extends RouteOptions = RouteOptions,
>(
  handler: THandler,
  optionsOrTransformer?: TOptions | RouteTransformer,
  ...transformers: RouteTransformer[]
): DefinedRoute<THandler, TOptions | RouteOptions> {
  const hasOptions =
    typeof optionsOrTransformer === "object" && optionsOrTransformer !== null;

  return {
    handler,
    options: hasOptions ? optionsOrTransformer : {},
    transformers: hasOptions
      ? transformers
      : optionsOrTransformer
        ? [optionsOrTransformer, ...transformers]
        : transformers,
  };
}

export async function createFastifyRoute<
  THandler extends RouteHandlerMethod,
  TOptions extends RouteOptions,
>(
  meta: RouteMeta,
  controller: DefinedRoute<THandler, TOptions>,
): Promise<FastifyRouteOptions> {
  let routeOptions: FastifyRouteOptions = {
    method: meta.method,
    url: meta.path,
    ...controller.options,
    handler: controller.handler,
  };

  for (const transformer of [
    ...controller.transformers,
    ...Object.values(transformers),
  ]) {
    routeOptions = await transformer(routeOptions);
  }

  return routeOptions;
}
