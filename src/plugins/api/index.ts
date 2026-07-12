import fp from "fastify-plugin";
import path from "node:path";
import { getChildren, loadDefaultJs } from "../../utils/index.js";
import { resolveApi, type ApiMetaOptions } from "./resolve.js";
import {
  appendPreHandler,
  defineRouteHandler,
  generateHelperTypes,
} from "./helper.js";
import { getListOpensyaConfig } from "../../config/load.js";
import { existsSync } from "node:fs";
import _ from "lodash";

export const api = fp(async (app) => {
  Object.assign(globalThis, { defineRouteHandler, appendPreHandler });
  generateHelperTypes();

  const routes: Record<
    string,
    { options: ApiMetaOptions; content: ReturnType<typeof fp> }
  > = {};

  async function loadApi(apiDir: string) {
    const files = getChildren(apiDir, { recursive: true, onlyFile: true });

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
    await app.register(route.content, route.options);
  }
});
