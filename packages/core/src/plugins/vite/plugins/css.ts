import type { Plugin } from "vite";
import { getListOpensyaConfig } from "../../../config/load.js";
import path from "node:path";
import _ from "lodash";
import { normalizeDir } from "@/utils/normalize-dir.js";

const VIRTUAL_ID = "virtual:css";
const RESOLVED_VIRTUAL_ID = "\0virtual:css";

export function viteCssPlugin(): Plugin {
  let cssFiles: string[] = [];

  return {
    name: "vite-opensya-css",
    enforce: "pre",

    resolveId(id) {
      if (id === VIRTUAL_ID) {
        return RESOLVED_VIRTUAL_ID;
      }
    },

    async load(id) {
      if (id !== RESOLVED_VIRTUAL_ID) return null;

      cssFiles = [];
      const configs = _.reverse(getListOpensyaConfig());

      for (const config of configs) {
        if (!config.css || !Array.isArray(config.css)) continue;

        for (const cssPath of config.css) {
          let resolved: { id: string } | null = null;

          // If the path is relative, resolve it against the layer's root directory (_srcDir)
          if (cssPath.startsWith(".")) {
            const absoluteLocalPath = path.resolve(config._srcDir, cssPath);
            resolved = await this.resolve(absoluteLocalPath);
          } else {
            // Otherwise (aliases like @/* or absolute paths), let Vite's native resolver handle it
            resolved = await this.resolve(cssPath);
          }

          if (resolved && resolved.id) {
            // If Vite successfully resolves the physical file, add it to the queue
            cssFiles.push(resolved.id);
          } else {
            console.warn(
              `[Opensya CSS] Failed to resolve style file: "${cssPath}" in layer configuration.`,
            );
          }
        }
      }

      // Generate imports using actual resolved and normalized paths relative to working directory
      return cssFiles
        .map((file) => {
          const rPath = normalizeDir(path.relative(process.cwd(), file));
          return `import "${rPath}";`;
        })
        .join("\n");
    },
  };
}
