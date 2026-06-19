import type {
  FastifyReply,
  FastifyRequest,
  HTTPMethods,
  RouteGenericInterface,
} from 'fastify';

export interface ControllerContext<T extends RouteGenericInterface> {
  req: FastifyRequest<T>;
  res: FastifyReply;
}

export interface ControllerOptions {
  method?: HTTPMethods | HTTPMethods[];
  path?: string;
  name?: string;
}

// export type DefinedController = {
//   route(app: FastifyInstance): Promise<void>;
//   init(filePath: string, parentDir: string): ControllerOptions;
// };

// export type DefineController = <
//   T extends RouteGenericInterface = RouteGenericInterface,
//   R = unknown,
// >(
//   handler: (context: ControllerContext<T>) => MayBePromise<R>,
//   options?: ControllerOptions,
// ) => DefinedController;
