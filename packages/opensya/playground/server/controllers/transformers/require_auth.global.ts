import {
  type RouteTransformer,
  UnauthorizedError,
  appendPreHandler,
} from "../../../../src/server";

export default function requireAuth(): RouteTransformer {
  return (options) => {
    return appendPreHandler(options, async (request) => {
      if (options.publicRoute) return;
      if (!request.user) throw new UnauthorizedError();
    });
  };
}

declare module "../../../../src/server" {
  interface OpensyaRouteOptions {
    publicRoute?: boolean;
  }
}
