import type { MayBePromise } from "@opensya/utils";

export interface ServiceMeta {
  name: string;
  file: string;
}

export function defineService<P extends unknown[], R = unknown>(
  handler: (...args: P) => MayBePromise<R>,
) {
  async function fn(...args: P) {
    return await handler(...args);
  }

  return {
    service: fn,
  };
}

export type DefineService = typeof defineService;
export type DefinedService = ReturnType<typeof defineService>;
