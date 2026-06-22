import { loadOpensyaConfig } from "../config";
import { ensureOutput } from "./dirs";

export async function init() {
  await loadOpensyaConfig();
  ensureOutput();
}
