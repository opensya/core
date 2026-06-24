import { compileTables } from "./table";

export async function compileDatabase() {
  await compileTables();
}
