import type { RouteTransformer } from "../transformer/define";

export const transformers = {} as Record<string, RouteTransformer>;

export function clearTransformers() {
  for (const key in transformers) {
    if (Object.hasOwn(transformers, key)) {
      delete transformers[key];
    }
  }
}
