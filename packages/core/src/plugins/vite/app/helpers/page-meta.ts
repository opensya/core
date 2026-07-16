// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PageMeta {}

export function definePageMeta(meta: PageMeta): PageMeta {
  return meta;
}

if (typeof globalThis !== "undefined" && !("definePageMeta" in globalThis)) {
  Object.assign(globalThis, { definePageMeta });
}
