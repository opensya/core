import { defineOpensyaConfig } from "./config";

export function defineGlobals() {
  globalThis.defineOpensyaConfig = defineOpensyaConfig;
}
