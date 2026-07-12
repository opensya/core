export * from "./server.js";

// import { writeClientTsconfig } from "./client";
import { writeServerTsconfig } from "./server.js";

export function generateTsconfig() {
  writeServerTsconfig();
  //   writeClientTsconfig();
}
