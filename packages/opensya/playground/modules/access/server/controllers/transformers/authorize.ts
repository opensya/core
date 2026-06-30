import { appendPreHandler, type RouteTransformer } from "@core/server";
import { authorizationService } from "../../utils/authorization_service";
import type { AuthContext, PermissionSlug } from "../../utils/types";
import type { FastifyRequest } from "fastify";

/**
 * Exige une permission atomique sur l'actor courant.
 * Throw 401 si non authentifié, 403 si permission manquante.
 *
 * @param slug        - Permission requise, ex : permission('job_posting:create')
 * @param getContext  - Optionnel, résout un AuthContext depuis la request
 *                      (utile pour scoper la vérification à une équipe)
 */
export default function authorize(
  slug: PermissionSlug,
  getContext?: (request: FastifyRequest) => AuthContext,
): RouteTransformer {
  return (options) =>
    appendPreHandler(options, async (request) => {
      const context = getContext?.(request);
      authorizationService.assert(request.actor, slug, context);
    });
}
