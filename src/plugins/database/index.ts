import fp from "fastify-plugin";
import { setup } from "./setup.js";

export const database = fp(async () => {
  Object.assign(globalThis, { database: await setup() });
});
