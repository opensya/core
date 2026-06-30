/* eslint-disable @typescript-eslint/no-empty-object-type */

import type {
  HTTPMethods,
  RouteHandlerMethod,
  RouteOptions as FastifyRouteOptions,
} from "fastify";
import type { RouteTransformer } from "../transformer";
import { globalTtransformers } from "./transformers";

export interface RouteMeta {
  name: string;
  file: string;
  path: string;
  method: HTTPMethods;
  idx: string;
}

export interface OpensyaRouteOptions {}

type RouteOptionsExtra = Omit<
  FastifyRouteOptions,
  "method" | "url" | "handler"
> &
  OpensyaRouteOptions;

declare module "fastify" {
  interface RouteOptions extends OpensyaRouteOptions {}
}

export type DefinedRoute<
  THandler extends RouteHandlerMethod = RouteHandlerMethod,
  TOptions extends RouteOptionsExtra = RouteOptionsExtra,
> = {
  handler: THandler;
  options: TOptions;
  transformers: RouteTransformer[];
};

export function defineRoute<THandler extends RouteHandlerMethod>(
  handler: THandler,
  ...transformers: RouteTransformer[]
): DefinedRoute<THandler, RouteOptionsExtra>;

export function defineRoute<
  THandler extends RouteHandlerMethod,
  TOptions extends RouteOptionsExtra,
>(
  handler: THandler,
  options: TOptions,
  ...transformers: RouteTransformer[]
): DefinedRoute<THandler, TOptions>;

export function defineRoute<
  THandler extends RouteHandlerMethod,
  TOptions extends RouteOptionsExtra = RouteOptionsExtra,
>(
  handler: THandler,
  optionsOrTransformer?: TOptions | RouteTransformer,
  ...transformers: RouteTransformer[]
): DefinedRoute<THandler, TOptions | RouteOptionsExtra> {
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
  TOptions extends RouteOptionsExtra,
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
    ...Object.values(globalTtransformers),
    ...controller.transformers,
  ]) {
    routeOptions = await transformer(routeOptions);
  }

  return routeOptions;
}
