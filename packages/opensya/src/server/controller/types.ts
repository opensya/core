import type {
  FastifyReply,
  FastifyRequest,
  HTTPMethods,
  RouteGenericInterface,
} from "fastify";

export interface ControllerContext<T extends RouteGenericInterface> {
  req: FastifyRequest<T>;
  res: FastifyReply;
}

export interface ControllerOptions {
  method?: HTTPMethods | HTTPMethods[];
  path?: string;
  name?: string;
}
