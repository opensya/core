import { join, relative } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { REGEXS } from "../utils";
import { getDirs } from "../../utils";
import { resolveRouteFromFilePath } from "./resolve_route";
import type { ControllerMeta } from "./define";
import chokidar from "chokidar";
import { atomicWriteFile, getChildren } from "@opensya/utils";

export function compileControllers() {
  const dirs = getDirs();
  const controllersDir = join(dirs.INPUT_DIR_SERVER, "controllers");

  const manifestDir = join(dirs.OUTPUT_DIR_SERVER, "controllers.json");
  atomicWriteFile(manifestDir, "{}");

  detectControllers(controllersDir);
  listen(controllersDir);
}

function listen(controllersDir: string) {
  if (!process.argv.includes("--dev")) return;
  if (!existsSync(controllersDir)) return;

  chokidar
    .watch(controllersDir, {
      ignoreInitial: true,
      ignored: (path, stats) => {
        if (!stats?.isFile()) return false;

        const isAccept = REGEXS.acceptFiles.test(path);
        return !isAccept;
      },
    })
    .on("add", () => {
      detectControllers(controllersDir);
      // runBootstrap();
    })
    .on("unlink", () => {
      detectControllers(controllersDir);
      // runBootstrap();
    })
    .on("change", () => {
      detectControllers(controllersDir);
      // runBootstrap();
    });
}

function detectControllers(parentDir: string) {
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
}
