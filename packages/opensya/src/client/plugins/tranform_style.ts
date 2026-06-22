import type { Plugin } from "vite";
import { dirname, join, relative } from "node:path";
import { getDirs } from "../../utils";
import { existsSync } from "node:fs";
import { imports, body } from "../css/content";
import {
  getOpensyaConfig,
  loadModuleOpensyaConfig,
  type UseOpensyaConfig,
} from "../../config";

export function viteTransformStylePlugin(): Plugin {
  const { CORE_DIR_CLIENT } = getDirs();
  const mainConfig = getOpensyaConfig();
  const styleFile = join(CORE_DIR_CLIENT, "style.css");

  async function getStyle(config: UseOpensyaConfig) {
    const imports: string[] = [];

    for (const module of config.modules) {
      const config = await loadModuleOpensyaConfig(module);
      imports.push(...(await getStyle(config)));
    }

    const stylesDir = join(config._dirs.INPUT_DIR_CLIENT, "styles");
    const mainDir = join(stylesDir, "main.css");

    if (!existsSync(mainDir)) return imports;

    imports.push(`@import "${toImportPath(styleFile, mainDir)}";`);

    return imports;
  }

  function toImportPath(styleFile: string, filePath: string) {
    const relativePath = relative(dirname(styleFile), filePath).replaceAll(
      "\\",
      "/",
    );
    return relativePath.startsWith(".") ? relativePath : `./${relativePath}`;
  }

  return {
    name: "viteTransformStylePlugin",
    enforce: "pre",

    async transform(code, id) {
      const dirs = getDirs();

      if (id !== styleFile) return;

      imports.push(...(await getStyle(mainConfig)));

      const sources = [
        `@source "${relative(dirname(styleFile), join(dirs.INPUT_DIR_CLIENT, "**/*"))}";`,
        `@source "${relative(dirname(styleFile), join(dirs.CORE_DIR_CLIENT, "ui/**/*"))}";`,
      ];

      code += [imports.join("\n"), sources.join("\n"), body].join("\n\n");

      return code;
    },
  };
}
