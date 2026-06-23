import {
  type RouteTransformer,
  appendPreHandler,
} from "../../../../src/server";

export default function requireAuth(): RouteTransformer {
  return (options) => {
    return appendPreHandler(options, async (request) => {
      if (options.publicRoute) return;
      await request.server.authenticate(request);
    });
  };
}

declare module "../../../../src/server" {
  interface OpensyaRouteOptions {
    publicRoute?: boolean;
  }
}
