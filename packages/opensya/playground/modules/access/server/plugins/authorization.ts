import { definePlugin, UnauthorizedError } from "@core/server";

import type { FastifyRequest, FastifyInstance } from "fastify";
import { authorizationService } from "../utils/authorization_service";
import { permissionCache } from "../utils/permission_cache";
import type { Actor } from "../utils/types";
import { ForbiddenError } from "@core/server";

// ─────────────────────────────────────────────────────────────────────────────
// Fastify plugin — Authorization
// ─────────────────────────────────────────────────────────────────────────────
//
// Enregistre :
//  - app.authorization → accès direct au service dans les plugins/hooks
//  - request.actor     → Actor résolu (null si non authentifié)
//  - app.authenticate  → hook qui throw 401 si pas de JWT valide
//  - app.authorize     → hook qui throw 403 si permission manquante

export default definePlugin(async (app: FastifyInstance) => {
  // ── Charger le cache de permissions au démarrage
  app.addHook("onReady", async () => {
    await permissionCache.load();
    app.log.info("[authorization] permission cache loaded");
  });

  // ── Décorer app avec le service
  app.decorate("authorization", authorizationService);

  // ── Résoudre l'actor sur chaque request authentifiée
  //    request.user est setté par @fastify/jwt (null si token absent/invalide)
  app.addHook("onRequest", async (request: FastifyRequest) => {
    if (!request.user?.sub) {
      request.actor = null;
      return;
    }

    request.actor = await authorizationService.resolveActor(request.user.sub);
  });

  // ── Enregistrer les erreurs d'autorisation comme réponses HTTP propres
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof UnauthorizedError) {
      return reply
        .status(401)
        .send({ error: "Unauthorized", message: error.message });
    }
    if (error instanceof ForbiddenError) {
      return reply
        .status(403)
        .send({ error: "Forbidden", message: error.message });
    }
    throw error; // propager aux autres handlers
  });

  app.log.info("[authorization] plugin registered");
});

// ─────────────────────────────────────────────────────────────────────────────
// Augmentation des types Fastify
// ─────────────────────────────────────────────────────────────────────────────

declare module "fastify" {
  interface FastifyInstance {
    authorization: typeof authorizationService;
  }

  interface FastifyRequest {
    actor: Actor | null;
  }
}
