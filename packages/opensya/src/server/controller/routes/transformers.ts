import type { RouteTransformer } from "../transformer/helpers";

export const transformers = {} as Record<string, RouteTransformer>;
export const globalTtransformers = {} as Record<string, RouteTransformer>;

export function clearTransformers() {
  for (const key in transformers) {
    if (Object.hasOwn(transformers, key)) {
      delete transformers[key];
    }
  }

  for (const key in globalTtransformers) {
    if (Object.hasOwn(transformers, key)) {
      delete globalTtransformers[key];
    }
  }
}
