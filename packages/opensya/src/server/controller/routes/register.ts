import type { FastifyInstance, RouteOptions } from "fastify";
import { getDirs } from "../../../utils";
import { join } from "node:path";

export async function registerRoutes(app: FastifyInstance) {
  const { OUTPUT_DIR_SERVER } = getDirs();

  const routes = (await import(
    join(OUTPUT_DIR_SERVER, "controllers/routes.js")
  )) as Record<string, RouteOptions>;

  for (const key in routes) {
    if (!Object.hasOwn(routes, key)) continue;

    const route = routes[key];
    const plugin = (app: FastifyInstance) => {
      app.route(route);
    };

    app.register(plugin);
  }
}
