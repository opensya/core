import type { App } from "vue";

export interface VuePluginContext {
  app: App;
}

export type VuePluginHook = (ctx: VuePluginContext) => void | Promise<void>;

export function defineVuePlugin(plugin: VuePluginHook): VuePluginHook {
  return plugin;
}

// Assign globally at runtime if not already done
if (typeof globalThis !== "undefined" && !("defineVuePlugin" in globalThis)) {
  Object.assign(globalThis, { defineVuePlugin });
}
