import { loadConfig } from "c12";

export interface OpensyaConfig {
  srcDir?: string;
}

export function defineOpensyaConfig<T extends OpensyaConfig>(config: T): T {
  return config;
}

const resolvedConfig: { value?: Required<OpensyaConfig> } = {};

export async function loadOpensyaConfig(): Promise<Required<OpensyaConfig>> {
  const result = await loadConfig<OpensyaConfig>({
    configFile: "opensya.config",

    defaultConfig: {
      srcDir: ".",
    },
  });

  resolvedConfig.value = result.config as Required<OpensyaConfig>;

  return resolvedConfig.value;
}

export function getOpensyaConfig(): Required<OpensyaConfig> {
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
