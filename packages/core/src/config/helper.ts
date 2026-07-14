export interface OpensyaConfig {
  srcDir?: string;
  modules?: string[];

  css?: string[];

  alias?: Record<string, string[]>;
}

export function defineOpensyaConfig<TConfig extends OpensyaConfig>(
  config: TConfig,
): TConfig {
  return config;
}

type DefineOpensyaConfig = typeof defineOpensyaConfig;

declare global {
  const defineOpensyaConfig: DefineOpensyaConfig;
}

Object.assign(globalThis, { defineOpensyaConfig });
