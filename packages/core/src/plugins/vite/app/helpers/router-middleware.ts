import type { RouteLocationNormalized } from "vue-router";

export type RouteMiddleware = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
) => unknown;

export function defineRouteMiddleware(
  middleware: RouteMiddleware,
): RouteMiddleware {
  return middleware;
}

if (
  typeof globalThis !== "undefined" &&
  !("defineRouteMiddleware" in globalThis)
) {
  Object.assign(globalThis, { defineRouteMiddleware });
}
