import path from "path/posix";
import { getListOpensyaConfig } from "../../config/load.js";
import { SERVER_DIRNAME } from "../../utils/dirs.js";
import { existsSync } from "fs";
import { getChildren } from "../../utils/get-children.js";
import { loadDefaultJs } from "../../utils/load-js.js";
import _ from "lodash";
import type { RouteMiddlewareDefinition } from "./helper/middleware.js";

export async function loadRouteMiddleware(): Promise<
  RouteMiddlewareDefinition[]
> {
  const configs = _.reverse(getListOpensyaConfig());
  const hooks: RouteMiddlewareDefinition[] = [];

  for (const { _srcDir } of configs) {
    const hooksDir = path.resolve(_srcDir, SERVER_DIRNAME, "middlewares");
    if (!existsSync(hooksDir)) continue;

    await load(hooksDir);
  }

  async function load(hooksDir: string) {
    const files = getChildren(hooksDir, {
      recursive: true,
      onlyFile: true,
      endWith: /\.(js|ts)$/,
    });

    for (const file of files) {
      const content = await loadDefaultJs<RouteMiddlewareDefinition>(file.path);
      if (!content) continue;

      hooks.push(content);
    }
  }

  return hooks;
}
