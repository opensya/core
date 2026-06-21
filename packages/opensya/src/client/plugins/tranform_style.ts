import type { Plugin } from "vite";
import { dirname, join, relative } from "node:path";
import { getDirs } from "../../utils";
import { existsSync } from "node:fs";
import { imports, body } from "../css/content";

export function viteTransformStylePlugin(): Plugin {
  return {
    name: "viteTransformStylePlugin",
    enforce: "pre",

    transform(code, id) {
      const dirs = getDirs();
      const styleFile = join(dirs.CORE_DIR, "client/style.css");

      if (id !== styleFile) return;

      const customStyle = getStyle(styleFile, dirs.INPUT_DIR_CLIENT);
      if (customStyle) imports.push(customStyle);

      const sources = [
        `@source "${relative(dirname(styleFile), join(dirs.INPUT_DIR_CLIENT, "**/*"))}";`,
        `@source "${relative(dirname(styleFile), join(dirs.CORE_DIR_CLIENT, "ui/**/*"))}";`,
      ];

      code += [imports.join("\n"), sources.join("\n"), body].join("\n\n");

      return code;
    },
  };
}

function getStyle(styleFile: string, stylesDir: string): string | null {
  const mainDir = join(stylesDir, "styles/main.css");

  if (!existsSync(mainDir)) {
    return null;
  }

  return `@import "${toImportPath(styleFile, mainDir)}";`;
}

function toImportPath(styleFile: string, filePath: string) {
  const relativePath = relative(dirname(styleFile), filePath).replaceAll(
    "\\",
    "/",
  );
  return relativePath.startsWith(".") ? relativePath : `./${relativePath}`;
}
