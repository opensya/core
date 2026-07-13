import type { FastifyInstance } from "fastify";

import database from "./database/index.js";
import api from "./api/index.js";
import vite from "./vite/index.js";
import { generateHelperTypes } from "./helper.js";
import { definePlugin } from "./helper.js";
import loadPlugins from "./load-plugins.js";

export async function registerPlugins(app: FastifyInstance) {
  generateHelperTypes();
  Object.assign(globalThis, { definePlugin });

  await app.register(database);
  await app.register(api);
  await app.register(vite);

  const plugins = await loadPlugins();

  for (const plugin of plugins) {
    await app.register(plugin);
  }
}
