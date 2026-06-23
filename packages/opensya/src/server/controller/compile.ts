import { compileRoutes } from "./routes";
import { compileTransformers } from "./transformer/compile";

export async function compileControllers() {
  await compileTransformers();
  await compileRoutes();
}
