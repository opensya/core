import { defineController } from "../controller/define";
import { defineService } from "../service/define";

export function defineGlobals() {
  globalThis.defineService = defineService;
  globalThis.defineController = defineController;
}
