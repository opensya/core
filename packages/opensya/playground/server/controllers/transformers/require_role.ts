import type { RouteTransformer } from "../../../../src/server";

export default function requireRole(): RouteTransformer {
  return (options) => {
    // ...
    return options;
  };
}
