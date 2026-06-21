import { loadOpensyaConfig } from "./config";
import { defineGlobals } from "./define_globals";
import { ensureOutput } from "./dirs";

export async function init() {
  defineGlobals();
  await loadOpensyaConfig();
  ensureOutput();
}
