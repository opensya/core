import { loadConfig } from "c12";
import { dirname, join } from "node:path";
import { CLIENT_DIRNAME, SERVER_DIRNAME } from "./utils";
import { existsSync } from "node:fs";
import type { Undefinedable } from "@opensya/utils";
import { createRequire } from "node:module";

export interface OpensyaConfig {
  srcDir?: string;
  modules?: string[];
}

export function defineOpensyaConfig<T extends OpensyaConfig>(config: T): T {
  return config;
}

export type UseOpensyaConfig = Required<OpensyaConfig> & {
  _main: boolean;
  _dirs: {
    cwd: string;
    INPUT_DIR: string;
    INPUT_DIR_SERVER: string;
    INPUT_DIR_CLIENT: string;
  };
};

const resolvedConfig: { value?: UseOpensyaConfig } = {};

export async function loadOpensyaConfig({
  cwd,
  setResolve = true,
}: { cwd?: string; setResolve?: boolean } = {}): Promise<UseOpensyaConfig> {
  const result = await loadConfig<OpensyaConfig>({
    configFile: "opensya.config",
    cwd,

    defaultConfig: {
      srcDir: ".",
      modules: [],
    },
  });

  const _config = result.config as UseOpensyaConfig;

  cwd ??= result.cwd ?? process.cwd();
  _config._main = false;

  const inputDir = join(cwd, _config.srcDir);
  _config._dirs = {
    cwd,
    INPUT_DIR: inputDir,
    INPUT_DIR_CLIENT: join(inputDir, CLIENT_DIRNAME),
    INPUT_DIR_SERVER: join(inputDir, SERVER_DIRNAME),
  };

  if (setResolve) {
    _config._main = true;
    resolvedConfig.value = _config;
  }

  return _config;
}

export async function loadModuleOpensyaConfig(
  name: string,
): Promise<UseOpensyaConfig> {
  let cwd: Undefinedable<string> = undefined;

  if (name.startsWith("modules/")) {
    cwd = join(getOpensyaConfig()._dirs.INPUT_DIR, name);
  }

  if (!cwd) {
    try {
      const require = createRequire(import.meta.url);
      const packageJsonPath = require.resolve(join(name, "package.json"), {
        paths: [process.cwd()],
      });

      cwd = join(dirname(packageJsonPath), "dist");
    } catch {
      // Ignore
    }
  }

  if (!cwd || !existsSync(cwd)) {
    throw new Error(
      `Failed to resolve Opensya module "${name}". The module was not found in the local "modules/" directory and could not be resolved from "node_modules".`,
    );
  }

  return await loadOpensyaConfig({ cwd, setResolve: false });
}

export function getOpensyaConfig(): UseOpensyaConfig {
  if (!resolvedConfig.value) {
    throw new Error(
      "Opensya config is not loaded. Call loadOpensyaConfig() first.",
    );
  }

  return resolvedConfig.value;
}

type DefineOpensyaConfig = typeof defineOpensyaConfig;

declare global {
  const defineOpensyaConfig: DefineOpensyaConfig;
}

Object.assign(globalThis, { defineOpensyaConfig });
