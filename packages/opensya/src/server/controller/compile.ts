import { join, relative } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { REGEXS } from "../utils";
import { getDirs } from "../../utils";
import { resolveRouteFromFilePath } from "./resolve_route";
import type { ControllerMeta } from "./define";
import chokidar, { type FSWatcher } from "chokidar";
import { atomicWriteFile, getChildren } from "@opensya/utils";
import {
  getOpensyaConfig,
  loadModuleOpensyaConfig,
  type UseOpensyaConfig,
} from "../../config";
import { restartServer } from "../run";

export async function compileControllers() {
  const dirs = getDirs();

  const manifestDir = join(dirs.OUTPUT_DIR_SERVER, "controllers.json");
  atomicWriteFile(manifestDir, "{}");

  await detectControllers(getOpensyaConfig());
}

let watcher: FSWatcher;

function listen(config: UseOpensyaConfig) {
  if (!process.argv.includes("--dev")) return;
  if (watcher) return;

  const parentDir = join(config._dirs.INPUT_DIR_SERVER, "controllers");
  if (!existsSync(parentDir)) return;

  watcher = chokidar
    .watch(parentDir, {
      ignoreInitial: true,
      ignored: (path, stats) => {
        if (!stats?.isFile()) return false;

        const isAccept = REGEXS.acceptFiles.test(path);
        return !isAccept;
      },
    })
    .on("add", async () => {
      await detectControllers(config);
      await restartServer();
    })
    .on("unlink", async () => {
      await detectControllers(config);
      await restartServer();
    })
    .on("change", async () => {
      await detectControllers(config);
      await restartServer();
    });
}

async function detectControllers(config: UseOpensyaConfig) {
  for (const module of config.modules) {
    const config = await loadModuleOpensyaConfig(module);
    await detectControllers(config);
  }

  const parentDir = join(config._dirs.INPUT_DIR_SERVER, "controllers");
  if (!existsSync(parentDir)) return {};

  const dirs = getDirs();

  const files = getChildren(parentDir, {
    recursive: true,
    onlyFile: true,
    endWith: REGEXS.acceptFiles,
  });

  let controllers: Record<string, ControllerMeta> = {};

  for (const file of files) {
    const route = resolveRouteFromFilePath(relative(parentDir, file.path));

    const idx = `${route.path}:${route.method}`;
    controllers[idx] = { file: file.path, ...route };
  }

  const manifestDir = join(dirs.OUTPUT_DIR_SERVER, "controllers.json");

  if (existsSync(manifestDir)) {
    const _controllers = JSON.parse(readFileSync(manifestDir, "utf8"));
    controllers = { ..._controllers, ...controllers };
  }

  atomicWriteFile(manifestDir, JSON.stringify(controllers, undefined, 2));

  if (config._main) listen(config);
}
