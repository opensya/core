import type { FastifyReply, FastifyRequest } from "fastify";

export interface ControllerContext {
  req: FastifyRequest;
  res: FastifyReply;
}

// export interface ControllerContext<T extends RouteGenericInterface> {
//   req: FastifyRequest<T>;
//   res: FastifyReply;
// }

export interface ControllerOptions {
  path?: string;
  name?: string;
}
