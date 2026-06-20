import { defineGlobals } from '../utils';
import { loadOpensyaConfig } from './config';

export async function runInit() {
  defineGlobals();
  await loadOpensyaConfig();
}
