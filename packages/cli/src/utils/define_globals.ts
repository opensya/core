import { defineOpensyaConfig } from './config';
import { defineGlobals as serverDefineGlobals } from '../server/utils';

export function defineGlobals() {
  globalThis.defineOpensyaConfig = defineOpensyaConfig;
  serverDefineGlobals();
}
