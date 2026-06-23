import type { RouteTransformer } from "../../../../src/server";

export default function requireAuth(): RouteTransformer {
  return (options) => {
    // ...
    return options;
  };
}
