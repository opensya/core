import { existsSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import type { Plugin } from "vite";
import { getDirs, init } from "../../utils";

const prefix = /^\/?@(ui|core):/;
const extensions = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".json"];

export function viteInitPlugin(): Plugin {
  return {
    name: "vite-plugin-app",
    enforce: "pre",
    resolveId,

    async buildStart() {
      await init();
    },
  };
}

export async function resolveId(id: string) {
  if (process.platform === "win32" && /^\.\.\/[A-Z]:/.test(id)) {
    return id.substring(3);
  }

  const match = id.match(prefix);
  if (!match) return undefined;

  const dirs = getDirs();
  const aliasType = match[1];
  const virtualName = id.replace(prefix, "");

  const baseDir =
    aliasType === "ui" ? join(dirs.CORE_DIR_CLIENT, "ui") : dirs.CORE_DIR;

  const basePath = normalize(join(baseDir, virtualName));
  const resolved = resolveFile(basePath);

  return resolved;
}

function resolveFile(basePath: string): string | undefined {
  if (existsSync(basePath)) {
    const stat = statSync(basePath);

    if (stat.isFile()) {
      return basePath;
    }

    if (stat.isDirectory()) {
      for (const extension of extensions) {
        const indexPath = join(basePath, `index${extension}`);

        if (existsSync(indexPath)) {
          return indexPath;
        }
      }
    }
  }

  if (!extname(basePath)) {
    for (const extension of extensions) {
      const filePath = `${basePath}${extension}`;

      if (existsSync(filePath)) {
        return filePath;
      }
    }
  }

  return undefined;
}
