import { relative, join } from "node:path";
import _ from "lodash";
import { getListOpensyaConfig } from "#core/config/load.js";
import { normalizeDir } from "#core/utils/normalize-dir.js";
import { getDirs } from "#core/utils/dirs.js";

/**
 * Collects and normalizes all custom Vite aliases defined in layers configuration.
 */
export function getCustomConfigAliases(): Record<string, string[]> {
  const dirs = getDirs();
  const customPaths: Record<string, string[]> = {};

  // On récupère les configurations (de la racine vers l'applicatif pour que l'applicatif surcharge si nécessaire)
  const configs = _.reverse(getListOpensyaConfig());

  for (const config of configs) {
    const aliasObj = config?.alias;
    if (!aliasObj) continue;

    for (const [aliasKey, targetPaths] of Object.entries(aliasObj)) {
      // On s'assure d'avoir un tableau de chemins
      const pathsArray = Array.isArray(targetPaths)
        ? targetPaths
        : [targetPaths];

      customPaths[aliasKey] = pathsArray.map((targetPath) => {
        // Si c'est un chemin relatif (commence par .), on le résout par rapport à la couche courante
        if (targetPath.startsWith(".")) {
          const absolutePath = join(config._srcDir, targetPath);
          return normalizeDir(relative(dirs.OUTPUT_DIR, absolutePath));
        }

        // Sinon, on le garde tel quel
        return normalizeDir(targetPath);
      });
    }
  }

  return customPaths;
}
