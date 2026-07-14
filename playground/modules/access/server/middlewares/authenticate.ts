import { UnauthorizedError } from "#core/error/utils.ts";

export default defineRouteMiddleware({
  pre(request) {
    if (request.routeOptions.config.publicRoute) return;
    if (!request.actor) throw new UnauthorizedError();
  },
});

declare module "fastify" {
  interface FastifyContextConfig {
    publicRoute?: boolean;
  }
}
