import type { ServiceMeta } from "./define";
import { REGEXS } from "../utils";
import { join, relative } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { atomicWriteFile, getChildren } from "@opensya/utils";
import { resolveServiceFromFilePath } from "./resolve_service";
import { getDirs } from "../../utils";
import { writeType } from "./typing";
import chokidar, { type FSWatcher } from "chokidar";
import {
  getOpensyaConfig,
  loadModuleOpensyaConfig,
  type UseOpensyaConfig,
} from "../../config";
import { restartServer } from "../run";

export async function compileServices() {
  const dirs = getDirs();

  const manifestDir = join(dirs.OUTPUT_DIR_SERVER, "services.json");
  atomicWriteFile(manifestDir, "{}");

  await detectServices(getOpensyaConfig());
}

let watcher: FSWatcher;

function listen(config: UseOpensyaConfig) {
  if (!process.argv.includes("--dev")) return;
  if (watcher) return;

  const parentDir = join(config._dirs.INPUT_DIR_SERVER, "services");
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
      await detectServices(config);
      restartServer();
    })
    .on("unlink", async () => {
      await detectServices(config);
      restartServer();
    })
    .on("change", async () => {
      await detectServices(config);
      restartServer();
    });
}

async function detectServices(config: UseOpensyaConfig) {
  for (const module of config.modules) {
    const config = await loadModuleOpensyaConfig(module);
    await detectServices(config);
  }

  const parentDir = join(config._dirs.INPUT_DIR_SERVER, "services");

  if (!existsSync(parentDir)) return;

  const dirs = getDirs();

  const files = getChildren(parentDir, {
    recursive: true,
    onlyFile: true,
    endWith: REGEXS.acceptFiles,
  });

  let services: Record<string, ServiceMeta> = {};

  for (const file of files) {
    const service = resolveServiceFromFilePath(relative(parentDir, file.path));

    services[service.name] = {
      file: file.path,
      ...service,
    };
  }

  const manifestDir = join(dirs.OUTPUT_DIR_SERVER, "services.json");

  if (existsSync(manifestDir)) {
    const _services = JSON.parse(readFileSync(manifestDir, "utf8"));
    services = { ..._services, ...services };
  }

  atomicWriteFile(manifestDir, JSON.stringify(services, undefined, 2));
  writeTypes(services);

  if (config._main) listen(config);
}

function writeTypes(services: Record<string, ServiceMeta>) {
  if (!process.argv.includes("--dev")) return;

  for (const key in services) {
    if (!Object.hasOwn(services, key)) continue;

    const service = services[key];
    writeType(service.file, service);
  }
}
