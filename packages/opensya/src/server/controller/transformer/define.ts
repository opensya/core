import type { MayBePromise } from "@opensya/utils";
import type { RouteOptions as FastifyRouteOptions } from "fastify";

export type RouteTransformer = (
  options: FastifyRouteOptions,
) => MayBePromise<FastifyRouteOptions>;

export type RouteTransformerMeta = {
  name: string;
  file: string;
  global?: boolean;
};

export type RouteTransformerGlobalHandler = () => RouteTransformer;
