import { writeClientTsconfig } from "./client";
import { writeServerTsconfig } from "./server";

export function writeTsconfig() {
  writeServerTsconfig();
  writeClientTsconfig();
}
