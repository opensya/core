import fp from "fastify-plugin";
import path from "node:path";
import { getChildren, loadDefaultJs } from "../../utils/index.js";
import { resolveApi } from "./resolve.js";
import {
  appendPreHandler,
  defineRouteHandler,
  generateHelperTypes,
} from "./helper.js";
import { getListOpensyaConfig } from "../../config/load.js";
import { existsSync } from "node:fs";

export const api = fp(async (app) => {
  Object.assign(globalThis, { defineRouteHandler, appendPreHandler });
  generateHelperTypes();

  async function loadApi(apiDir: string) {
    const files = getChildren(apiDir, { recursive: true, onlyFile: true });

    for (const file of files) {
      const content = await loadDefaultJs<ReturnType<typeof fp>>(file.path);
      if (!content) continue;

      const options = resolveApi(apiDir, file.path);
      await app.register(content, options);
    }
  }

  const configs = getListOpensyaConfig();

  for (const { _srcDir } of configs) {
    const apiDir = path.resolve(_srcDir, "server/api");
    if (!existsSync(apiDir)) continue;

    await loadApi(apiDir);
  }
});
