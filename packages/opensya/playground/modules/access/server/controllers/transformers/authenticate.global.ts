import {
  appendPreHandler,
  UnauthorizedError,
  type RouteTransformer,
} from "@core/server";

/**
 * Exige un utilisateur authentifié.
 * Injecte un preHandler qui throw UnauthorizedError (401) si request.actor est null.
 */
export default function authenticate(): RouteTransformer {
  return (options) =>
    appendPreHandler(options, async (request) => {
      if (options.publicRoute) return;
      if (!request.actor) throw new UnauthorizedError();
    });
}

declare module "@core/server" {
  interface OpensyaRouteOptions {
    publicRoute?: boolean;
  }
}
