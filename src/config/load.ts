import path from "node:path";
import { loadConfig } from "c12";
import { OpensyaConfig } from "./helper";
import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import _ from "lodash";

export type UseOpensyaConfig = Required<OpensyaConfig> & {
  _main: boolean;
  _cwd: string;
  _srcDir: string;
};

export const configs: Record<string, UseOpensyaConfig> = {};

export async function loadOpensyaConfig({
  cwd,
  name,
}: {
  cwd: string;
  name?: string;
}): Promise<UseOpensyaConfig> {
  name ??= "main";

  const result = await loadConfig<OpensyaConfig>({
    configFile: "opensya.config",
    cwd,

    defaultConfig: {
      srcDir: ".",
      modules: [],
    },
  });

  const _config = result.config as UseOpensyaConfig;

  _config._main = cwd === process.cwd();
  _config._cwd = cwd;
  _config._srcDir = path.resolve(cwd, _config.srcDir);

  configs[name] = _.merge(configs[name] ?? {}, _config);

  for (const module of _config.modules) {
    const cwd = await getModuleDir(module);
    await loadOpensyaConfig({ cwd, name: module });
  }

  return _config;
}

export function getOpensyaConfig(name = "main"): UseOpensyaConfig {
  if (!configs[name]) {
    throw new Error(
      "Opensya config is not loaded. Call loadOpensyaConfig() first.",
    );
  }

  return configs[name];
}

async function getModuleDir(name: string) {
  let cwd: string | undefined = undefined;

  if (name.startsWith("modules/")) {
    cwd = path.resolve(configs["main"]._srcDir, name);
  }

  if (!cwd) {
    try {
      const require = createRequire(import.meta.url);
      const packageJsonPath = require.resolve(
        path.resolve(name, "package.json"),
        {
          paths: [process.cwd()],
        },
      );

      cwd = path.relative(path.dirname(packageJsonPath), "dist");
    } catch {
      // Ignore
    }
  }

  if (!cwd || !existsSync(cwd)) {
    throw new Error(
      `Failed to resolve Opensya module "${name}". The module was not found in the local "modules/" directory and could not be resolved from "node_modules".`,
    );
  }

  return cwd;
}
