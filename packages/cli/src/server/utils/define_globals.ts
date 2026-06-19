import { defineController } from '../controller/define';

export function defineGlobals() {
  globalThis.defineController = defineController;
}
