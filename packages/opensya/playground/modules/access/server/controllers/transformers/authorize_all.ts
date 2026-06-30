import { appendPreHandler, type RouteTransformer } from "@core/server";
import { authorizationService } from "../../utils/authorization_service";
import type { AuthContext, PermissionSlug } from "../../utils/types";
import type { FastifyRequest } from "fastify";

/**
 * Exige que l'actor ait TOUTES les permissions listées.
 * Throw 401 si non authentifié, 403 à la première permission manquante.
 *
 * @param slugs       - Liste de permissions, toutes requises
 * @param getContext  - Optionnel, résout un AuthContext depuis la request
 */
export default function authorizeAll(
  slugs: PermissionSlug[],
  getContext?: (request: FastifyRequest) => AuthContext,
): RouteTransformer {
  return (options) =>
    appendPreHandler(options, async (request: FastifyRequest) => {
      const context = getContext?.(request);
      authorizationService.assertAll(request.actor, slugs, context);
    });
}
