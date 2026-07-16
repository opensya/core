import fp from "fastify-plugin";
import { setup } from "./setup.js";

export default fp(async (app) => {
  app.addHook("onReady", async () => {
    await setup();
  });

  app.addHook("onClose", async () => {
    await database?.close();
  });
});
