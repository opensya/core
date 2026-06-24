import type { Plugin } from "vite";
import { existsSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { getChildren, normalizeDir } from "@opensya/utils";
import {
  getOpensyaConfig,
  loadModuleOpensyaConfig,
  type UseOpensyaConfig,
} from "../../config";

const VIRTUAL_ID = "virtual:layouts";
const RESOLVED_VIRTUAL_ID = "\0virtual:layouts";

export function viteTransformLayoutsPlugin(): Plugin {
  const mainConfig = getOpensyaConfig();

  function toImportPath(filePath: string) {
    return normalizeDir(
      relative(process.cwd(), filePath.replaceAll("\\", "/")),
    );
  }

  function resolveLayoutName(filePath: string, layoutsDir: string) {
    let name = relative(layoutsDir, filePath).replaceAll("\\", "/");

    const ext = extname(name);
    name = name.slice(0, -ext.length);

    if (name.endsWith("/index")) {
      name = name.slice(0, -"/index".length);
    }

    return name || "default";
  }

  async function getLayouts(config: UseOpensyaConfig): Promise<
    Array<{
      name: string;
      path: string;
    }>
  > {
    const layouts: Array<{ name: string; path: string }> = [];

    for (const module of config.modules) {
      const moduleConfig = await loadModuleOpensyaConfig(module);
      layouts.push(...(await getLayouts(moduleConfig)));
    }

    const layoutsDir = join(config._dirs.INPUT_DIR_CLIENT, "layouts");

    if (!existsSync(layoutsDir)) return layouts;

    const files = getChildren(layoutsDir, {
      recursive: true,
      onlyFile: true,
      endWith: /\.(tsx|jsx)$/,
    });

    for (const file of files) {
      layouts.push({
        name: resolveLayoutName(file.path, layoutsDir),
        path: file.path,
      });
    }

    return layouts;
  }

  async function generateCode() {
    const layouts = await getLayouts(mainConfig);

    const imports = layouts
      .map((layout, index) => {
        return `import Layout${index} from "${toImportPath(layout.path)}";`;
      })
      .join("\n");

    const records = layouts
      .map((layout, index) => {
        return `${JSON.stringify(layout.name)}: Layout${index}`;
      })
      .join(",\n");

    return `
${imports}

export const layouts = {
${records}
};
`;
  }

  return {
    name: "vite-opensya-layouts",
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
