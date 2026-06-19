import { MayBePromise } from '@core/utils';

export interface ServiceMeta {
  name: string;
  file: string;
}

export function defineSerice<P extends unknown[], R = unknown>(
  handler: (...args: P) => MayBePromise<R>,
) {
  async function fn(...args: P) {
    return await handler(...args);
  }

  return {
    service: fn,
  };
}

export type DefineService = typeof defineSerice;
export type DefinedService = ReturnType<typeof defineSerice>;

declare global {
  var defineSerice: DefineService;
}
