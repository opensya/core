import _ from "lodash";
import { getListOpensyaConfig } from "../config/load.js";
import { getDirs, SERVER_DIRNAME } from "../utils/dirs.js";
import path from "node:path";
import { existsSync } from "node:fs";
import { getChildren } from "../utils/get-children.js";
import { loadDefaultJs } from "../utils/load-js.js";
import type { FastifyPluginCallback } from "fastify";

export default async function loadPlugins(): Promise<FastifyPluginCallback[]> {
  const configs = _.reverse(getListOpensyaConfig());
  const { OUTPUT_DIR_SERVER } = getDirs();

  const plugins: FastifyPluginCallback[] = [];

  for (const { _srcDir } of configs) {
    const pluginsDir = path.resolve(_srcDir, SERVER_DIRNAME, "plugins");
    if (!existsSync(pluginsDir)) continue;

    await load(pluginsDir);
  }

  async function load(pluginsDir: string) {
    const files = getChildren(pluginsDir, {
      recursive: true,
      onlyFile: true,
      endWith: /\.(js|ts)$/,
    });

    for (const file of files) {
      const content = await loadDefaultJs<FastifyPluginCallback>(file.path);
      if (!content) continue;

      plugins.push(content);
    }
  }

  return plugins;
}
