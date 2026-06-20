import { defineController } from '../controller/define';
import { defineSerice } from '../service/define';

export function defineGlobals() {
  globalThis.defineSerice = defineSerice;
  globalThis.defineController = defineController;
}
