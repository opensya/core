import type { Plugin } from "vite";
import { join, relative } from "node:path";
import { existsSync } from "node:fs";

import { getDirs } from "../../utils";
import {
  getOpensyaConfig,
  loadModuleOpensyaConfig,
  type UseOpensyaConfig,
} from "../../config";

import { imports as baseImports, body } from "../css/content";
import { normalizeDir } from "@opensya/utils";

const VIRTUAL_ID = "virtual:style";
const RESOLVED_VIRTUAL_ID = "\0virtual:style.css";

export function viteTransformStylePlugin(): Plugin {
  const mainConfig = getOpensyaConfig();

  async function getStyleImports(config: UseOpensyaConfig): Promise<string[]> {
    const styleImports: string[] = [];

    for (const module of config.modules) {
      const moduleConfig = await loadModuleOpensyaConfig(module);
      styleImports.push(...(await getStyleImports(moduleConfig)));
    }

    const stylesDir = join(config._dirs.INPUT_DIR_CLIENT, "styles");
    const mainCssFile = join(stylesDir, "main.css");

    if (!existsSync(mainCssFile)) {
      return styleImports;
    }

    styleImports.push(`@import "${toImportPath(mainCssFile)}";`);

    return styleImports;
  }

  function toImportPath(filePath: string) {
    return normalizeDir(
      relative(process.cwd(), filePath.replaceAll("\\", "/")),
    );
  }

  async function generateCode() {
    const dirs = getDirs();
    const moduleStyleImports = await getStyleImports(mainConfig);

    const sources = [
      `@source "${toImportPath(join(dirs.INPUT_DIR_CLIENT, "**/*"))}";`,
    ];

    return [
      ...baseImports,
      ...moduleStyleImports,
      "",
      ...sources,
      "",
      body,
    ].join("\n");
  }

  return {
    name: "vite-opensya-style",
    enforce: "pre",

    resolveId(id) {
      if (id === VIRTUAL_ID) {
        return RESOLVED_VIRTUAL_ID;
      }
    },

    async load(id) {
      if (id !== RESOLVED_VIRTUAL_ID) return null;

      return generateCode();
    },
  };
}
