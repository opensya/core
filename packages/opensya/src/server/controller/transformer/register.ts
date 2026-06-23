import type { RouteOptions } from "fastify";
import { getDirs } from "../../../utils";
import { join } from "node:path";
import { transformers } from "../routes/transformers";

export async function registerTransformers() {
  const { OUTPUT_DIR_SERVER } = getDirs();

  const _transformers = (await import(
    join(OUTPUT_DIR_SERVER, "controllers/transformers.js")
  )) as Record<string, RouteOptions>;

  Object.assign(transformers, _transformers);
}
