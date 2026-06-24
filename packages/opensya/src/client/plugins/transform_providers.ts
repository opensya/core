import type { Plugin } from "vite";
import { existsSync } from "node:fs";
import { getChildren } from "@opensya/utils";
import {
  getOpensyaConfig,
  loadModuleOpensyaConfig,
  type UseOpensyaConfig,
} from "../../config";
import { join } from "node:path";

const VIRTUAL_ID = "virtual:providers";
const RESOLVED_VIRTUAL_ID = "\0virtual:providers";

export function viteTransformProvidersPlugin(): Plugin {
  const mainConfig = getOpensyaConfig();

  async function getProviderFiles(config: UseOpensyaConfig): Promise<string[]> {
    const providers: string[] = [];

    for (const module of config.modules) {
      const moduleConfig = await loadModuleOpensyaConfig(module);
      providers.push(...(await getProviderFiles(moduleConfig)));
    }

    const clientDir = join(config._dirs.INPUT_DIR_CLIENT, "providers");

    if (!existsSync(clientDir)) {
      return providers;
    }

    const files = getChildren(clientDir, {
      recursive: true,
      onlyFile: true,
      endWith: /\.global\.(tsx|jsx)$/,
    });

    for (const file of files) {
      providers.push(file.path);
    }

    return providers;
  }

  function toImportPath(filePath: string) {
    return filePath.replaceAll("\\", "/");
  }

  async function generateCode() {
    const providerFiles = await getProviderFiles(mainConfig);

    const imports = providerFiles
      .map((filePath, index) => {
        return `import Provider${index} from "${toImportPath(filePath)}";`;
      })
      .join("\n");

    const providerNames = providerFiles
      .map((_, index) => `Provider${index}`)
      .join(", ");

    return `
${imports}

export const providers = [${providerNames}];
`;
  }

  return {
    name: "vite-opensya-providers",
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
