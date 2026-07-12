import type { setup } from "../../../src/plugins/database/setup.ts";
  
declare global {
  const database: Awaited<ReturnType<typeof setup>>;
}
