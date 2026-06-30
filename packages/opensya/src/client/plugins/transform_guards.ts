import type { Plugin } from "vite";
import { existsSync } from "node:fs";
import { getChildren } from "@opensya/utils";
import {
  getOpensyaConfig,
  loadModuleOpensyaConfig,
  type UseOpensyaConfig,
} from "../../config";
import { join } from "node:path";

const VIRTUAL_ID = "virtual:guards";
const RESOLVED_VIRTUAL_ID = "\0virtual:guards";

export function viteTransformGuardsPlugin(): Plugin {
  const mainConfig = getOpensyaConfig();

  async function getProviderFiles(config: UseOpensyaConfig): Promise<string[]> {
    const guards: string[] = [];

    for (const module of config.modules) {
      const moduleConfig = await loadModuleOpensyaConfig(module);
      guards.push(...(await getProviderFiles(moduleConfig)));
    }

    const clientDir = join(config._dirs.INPUT_DIR_CLIENT, "guards");

    if (!existsSync(clientDir)) {
      return guards;
    }

    const files = getChildren(clientDir, {
      recursive: true,
      onlyFile: true,
      endWith: /\.(tsx|jsx)$/,
    });

    for (const file of files) {
      guards.push(file.path);
    }

    return guards;
  }

  function toImportPath(filePath: string) {
    return filePath.replaceAll("\\", "/");
  }

  async function generateCode() {
    const gaurdsFiles = await getProviderFiles(mainConfig);

    const imports = gaurdsFiles
      .map((filePath, index) => {
        return `import Guard${index} from "${toImportPath(filePath)}";`;
      })
      .join("\n");

    const gaurdNames = gaurdsFiles
      .map((_, index) => `Guard${index}`)
      .join(", ");

    return `
${imports}

export const guards = [${gaurdNames}];
`;
  }

  return {
    name: "vite-opensya-guards",
    enforce: "pre",

    resolveId(id) {
      if (id === VIRTUAL_ID) {
        return RESOLVED_VIRTUAL_ID;
      }
    },

    async load(id) {
      if (id !== RESOLVED_VIRTUAL_ID) return;

      return generateCode();
    },
  };
}
