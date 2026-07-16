import type { RouteMeta } from "vue-router";

export function definePageMeta(meta: RouteMeta): RouteMeta {
  return meta;
}

if (typeof globalThis !== "undefined" && !("definePageMeta" in globalThis)) {
  Object.assign(globalThis, { definePageMeta });
}
