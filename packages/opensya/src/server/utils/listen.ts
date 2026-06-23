import chokidar, { type FSWatcher } from "chokidar";
import type { UseOpensyaConfig } from "../../config";
import { join } from "path";
import { REGEXS } from "./regexs";
import type { MayBePromise } from "@opensya/utils";
import { existsSync } from "fs";
import { restartServer } from "../run";

const watchers: Record<string, FSWatcher> = {};

export function listen(
  config: UseOpensyaConfig,
  dir: string,
  cb: (config: UseOpensyaConfig) => MayBePromise<void>,
) {
  if (!process.argv.includes("--dev")) return;

  const parentDir = join(config._dirs.INPUT_DIR_SERVER, dir);
  if (!existsSync(parentDir)) return;
  if (watchers[parentDir]) return;

  watchers[parentDir] = chokidar
    .watch(parentDir, {
      ignoreInitial: true,
      ignored: (path, stats) => {
        if (!stats?.isFile()) return false;

        const isAccept = REGEXS.acceptFiles.test(path);
        return !isAccept;
      },
    })
    .on("add", async () => {
      await cb(config);
      await restartServer();
    })
    .on("unlink", async () => {
      await cb(config);
      await restartServer();
    })
    .on("change", async () => {
      await cb(config);
      await restartServer();
    });
}
