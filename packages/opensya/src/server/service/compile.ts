import type { ServiceMeta } from "./helper";
import { getWatchDirs, REGEXS } from "../utils";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { atomicWriteFile, getChildren, readJson, _ } from "@opensya/utils";
import { resolveServiceFromFilePath } from "./resolve_service";
import { getDirs } from "../../utils";
import chokidar from "chokidar";
import {
  getOpensyaConfig,
  loadModuleOpensyaConfig,
  type UseOpensyaConfig,
} from "../../config";
import { loadDefaultJs } from "../utils/load_js";
import { generateServices } from "./generate_service";

export async function compileServices() {
  const dirs = getDirs();

  const manifestDir = join(dirs.OUTPUT_DIR_SERVER, "services/services.json");
  let manifest = readJson<Record<string, ServiceMeta>>(manifestDir, {});

  const onFinish = _.debounce(async () => {
    manifest = {};

    await detectServices(getOpensyaConfig());
    atomicWriteFile(manifestDir, JSON.stringify(manifest, undefined, 2));
    generateServices(manifest);

    //  restartServer();
  }, 300);

  chokidar
    .watch(
      getWatchDirs(getOpensyaConfig()._dirs.INPUT_DIR_SERVER, "services"),
      {
        ignoreInitial: true,
        ignored: (path, stats) => {
          if (!stats?.isFile()) return false;

          const isAccept = REGEXS.acceptFiles.test(path);
          return !isAccept;
        },
      },
    )
    .on("add", () => onFinish())
    .on("change", () => onFinish())
    .on("unlink", () => onFinish());

  onFinish();

  async function detectServices(config: UseOpensyaConfig) {
    for (const module of config.modules) {
      const config = await loadModuleOpensyaConfig(module);
      await detectServices(config);
    }

    const parentDir = join(config._dirs.INPUT_DIR_SERVER, "services");

    if (!existsSync(parentDir)) return;

    const files = getChildren(parentDir, {
      recursive: true,
      onlyFile: true,
      endWith: REGEXS.acceptFiles,
    });

    for (const file of files) {
      const service = resolveServiceFromFilePath(parentDir, file.path);

      const content = await loadDefaultJs(file.path);
      if (!content) continue;

      manifest[service.name] = service;
    }

    // writeTypes(services);
  }
}
