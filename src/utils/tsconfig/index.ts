export * from "./server.js";
export * from "./client.js";

import { writeServerTsconfig } from "./server.js";
import { writeClientTsconfig } from "./client.js";

export function generateTsconfig() {
  writeServerTsconfig();
  writeClientTsconfig();
}
