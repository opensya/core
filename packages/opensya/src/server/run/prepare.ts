import "dotenv/config";

import { compileControllers } from "../controller";
import { compileServices } from "../service";
import { compileDatabase } from "../database";
import { init, writeTsconfig } from "../../utils";

export async function runPrepare() {
  await init();

  await compileDatabase();
  await compileServices();
  await compileControllers();

  writeTsconfig();
}
