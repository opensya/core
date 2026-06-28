import type { FastifyInstance } from "fastify";
import { getDirs } from "../../utils";
import { join } from "node:path";

export async function registerPlugins(app: FastifyInstance) {
  const { OUTPUT_DIR_SERVER } = getDirs();

  const { plugins } = await import(
    join(OUTPUT_DIR_SERVER, "plugins/plugins.js")
  );

  for (const plugin of plugins) app.register(plugin);
}
