import fp from "fastify-plugin";
import path from "node:path";
import { getChildren, loadDefaultJs } from "../../utils/index.js";
import { resolveApi } from "./resolve.js";
import { appendPreHandler, defineRouteHandler } from "./helper.js";

export const api = fp(async (app) => {
  Object.assign(globalThis, { defineRouteHandler, appendPreHandler });

  async function loadApi(apiDir: string) {
    const files = getChildren(apiDir, { recursive: true, onlyFile: true });

    for (const file of files) {
      const content = await loadDefaultJs<ReturnType<typeof fp>>(file.path);
      if (!content) continue;

      const options = resolveApi(apiDir, file.path);
      await app.register(content, options);
    }
  }

  const apiDir = path.resolve(process.cwd(), "playground", "server/api");
  await loadApi(apiDir);
});
