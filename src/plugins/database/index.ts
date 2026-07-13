import fp from "fastify-plugin";
import { setup } from "./setup.js";

export default fp(async (app) => {
  await setup();

  app.addHook("onClose", async () => {
    await database?.close();
  });
});
