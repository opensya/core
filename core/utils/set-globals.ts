import { defineOpensyaConfig } from '@opensya/config';

export async function setGlobls() {
  await import('@opensya/share/set-globals');
  globalThis.defineOpensyaConfig = defineOpensyaConfig;
}
