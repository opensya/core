import fp from "fastify-plugin";
import path from "node:path";
import { getChildren, loadDefaultJs } from "../../utils/index.js";
import { resolveApi, type ApiMetaOptions } from "./resolve.js";
import { registerHelpers } from "./helper/index.js";
import { getListOpensyaConfig } from "../../config/load.js";
import { existsSync } from "node:fs";
import _ from "lodash";
import { loadRouteMiddleware } from "./load-middlewares.js";

export default fp(async (app) => {
  registerHelpers();

  const middlewares = await loadRouteMiddleware();

  const routes: Record<
    string,
    { options: ApiMetaOptions; content: ReturnType<typeof fp> }
  > = {};

  async function loadApi(apiDir: string) {
    const files = getChildren(apiDir, {
      recursive: true,
      onlyFile: true,
      endWith: /\.(js|ts)$/,
    });

    for (const file of files) {
      const content = await loadDefaultJs<ReturnType<typeof fp>>(file.path);
      if (!content) continue;

      const options = resolveApi(apiDir, file.path);
      routes[options.idx] = { options, content };
    }
  }

  const configs = _.reverse(getListOpensyaConfig());
  for (const { _srcDir } of configs) {
    const apiDir = path.resolve(_srcDir, "server/api");
    if (!existsSync(apiDir)) continue;

    await loadApi(apiDir);
  }

  for (const idx in routes) {
    if (!Object.hasOwn(routes, idx)) continue;

    const route = routes[idx]!;
    await app.register(route.content, { ...route.options, middlewares });
  }
});
