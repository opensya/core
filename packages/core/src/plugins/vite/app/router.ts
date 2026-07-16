import { createRouter, createWebHistory } from "vue-router";
import { routes } from "virtual:routes";
import {
  globalMiddlewares,
  namedMiddlewares,
} from "virtual:router-middlewares";

import "./helpers/router-middleware.js";
import "./helpers/page-meta.js";

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Intercepteur global
router.beforeEach(async (to, from, next) => {
  console.log(to);

  // 1. On parcourt toutes les routes imbriquées/parentes résolues pour cette transition
  for (const record of to.matched) {
    if (typeof record.meta === "function") {
      // On résout l'import dynamique (?macro=true) pour ce niveau de route
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      const resolvedMeta = await (record.meta as Function)();
      // On remplace la fonction par l'objet réel dans to.matched
      record.meta = resolvedMeta || {};
    }
  }

  // 2. On reconstruit proprement to.meta pour la transition en cours
  // en fusionnant les métadonnées du parent vers l'enfant (comportement natif de vue-router)
  to.meta = to.matched.reduce((acc, record) => {
    return { ...acc, ...record.meta };
  }, {});
  console.log(to);

  // 1. Récupérer les middlewares nommés définis dans le composant (via meta)
  const metaMiddleware = to.meta.middleware;
  const localMiddlewareNames = Array.isArray(metaMiddleware)
    ? metaMiddleware
    : typeof metaMiddleware === "string"
      ? [metaMiddleware]
      : [];

  // 2. Construire la file d'attente (Queue) ordonnée : Globaux d'abord, puis Locaux
  const middlewareQueue = [...globalMiddlewares];

  for (const name of localMiddlewareNames) {
    const middleware = namedMiddlewares[name as keyof typeof namedMiddlewares];
    if (middleware) {
      middlewareQueue.push(middleware);
    } else {
      console.warn(
        `[Opensya] Middleware "${name}" not found in your middlewares folder.`,
      );
    }
  }

  // 3. Exécuter la file d'attente séquentiellement
  for (const middleware of middlewareQueue) {
    try {
      const result = await middleware(to, from);

      // Si le middleware renvoie explicitement false, on annule la navigation
      if (result === false) {
        return next(false);
      }

      // Si le middleware renvoie un chemin de redirection (string ou objet RouteLocationRaw)
      if (
        typeof result === "string" ||
        (result && typeof result === "object")
      ) {
        return next(result);
      }
    } catch (err) {
      console.error("[Opensya] Error in route middleware:", err);
      return next(false);
    }
  }

  // Si tout le monde a validé, on laisse passer
  next();
});

export default router;
