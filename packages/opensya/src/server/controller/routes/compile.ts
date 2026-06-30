import { join } from "node:path";
import { existsSync } from "node:fs";
import { REGEXS } from "../../utils";
import { getDirs } from "../../../utils";
import { resolveRouteMeta } from "./resolve_meta";
import type { RouteMeta, DefinedRoute } from "./helpers";
import { atomicWriteFile, getChildren, readJson } from "@opensya/utils";
import {
  getOpensyaConfig,
  loadModuleOpensyaConfig,
  type UseOpensyaConfig,
} from "../../../config";
import { writeFastifyRoute, writeFastifyRouteIndex } from "./write_route";
import { listen } from "../../utils/listen";
import { loadDefaultJs } from "../../utils/load_js";

export async function compileRoutes() {
  const { OUTPUT_DIR_SERVER } = getDirs();
  const manifestDir = join(OUTPUT_DIR_SERVER, "controllers/routes.json");

  atomicWriteFile(manifestDir, "{}");
  await detectControllers(getOpensyaConfig());

  async function detectControllers(config: UseOpensyaConfig) {
    for (const module of config.modules) {
      const config = await loadModuleOpensyaConfig(module);
      await detectControllers(config);
    }

    const dir = join(config._dirs.INPUT_DIR_SERVER, "controllers/routes");
    if (!existsSync(dir)) return;

    const files = getChildren(dir, {
      recursive: true,
      onlyFile: true,
      endWith: REGEXS.acceptFiles,
    });

    const controllers = Object.fromEntries(
      files.map((file) => {
        const meta = resolveRouteMeta(dir, file.path);
        return [meta.idx, meta];
      }),
    ) satisfies Record<string, RouteMeta>;

    for (const key in controllers) {
      if (!Object.hasOwn(controllers, key)) continue;
      await compile(controllers[key]);
    }

    writeFastifyRouteIndex();
    if (config._main) listen(config, "controllers/routes", detectControllers);
  }

  async function compile(meta: RouteMeta) {
    const route = await loadDefaultJs<DefinedRoute>(meta.file);
    if (!route) return;

    atomicWriteFile(
      manifestDir,
      JSON.stringify(
        {
          ...readJson<Record<string, RouteMeta>>(manifestDir, {}),
          [meta.idx]: meta,
        },
        null,
        2,
      ),
    );

    writeFastifyRoute(meta);
  }
}
