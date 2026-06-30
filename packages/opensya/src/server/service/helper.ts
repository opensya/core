import type { MayBePromise } from "@opensya/utils";

export interface ServiceMeta {
  name: string;
  file: string;
}

export function defineService<TArgs extends unknown[], TReturn = unknown>(
  handler: (...args: TArgs) => MayBePromise<TReturn>,
) {
  return handler;
}

export type DefineService = typeof defineService;
export type DefinedService = ReturnType<typeof defineService>;

export function createService<TArgs extends unknown[], TReturn = unknown>(
  handler: (...args: TArgs) => MayBePromise<TReturn>,
) {
  async function fn(...args: TArgs) {
    return await handler(...args);
  }

  return fn;
}
