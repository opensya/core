import fp from "fastify-plugin";
import middie from "@fastify/middie";
import { createServer, type ViteDevServer } from "vite";
import { getPlugins } from "../../client/plugins";
import { getIndexHtml } from "../../client/html";

declare module "fastify" {
  interface FastifyInstance {
    vite: ViteDevServer;
  }
}

// function shouldServeHtml(url?: string): boolean {
//   if (!url) return false;

//   if (url.startsWith("/api")) return false;
//   if (url.startsWith("/@vite")) return false;
//   if (url.startsWith("/@react-refresh")) return false;
//   if (url.startsWith("/src")) return false;
//   if (url.startsWith("/node_modules")) return false;

//   if (url.startsWith("/@core:")) return false;
//   if (url.startsWith("/@ui:")) return false;

//   return true;
// }

export const vite = fp(async (app) => {
  await app.register(middie);

  const vite = await createServer({
    root: process.cwd(),
    server: { middlewareMode: true },
    appType: "custom",
    plugins: getPlugins(),
  });

  app.decorate("vite", vite);

  app.use((req, res, next) => {
    if (req.url?.startsWith("/api")) return next();
    // if (shouldServeHtml(req.url)) return next();

    return vite.middlewares(req, res, next);
  });

  app.addHook("onClose", async () => {
    await vite.close();
  });

  app.get("*", async (request, reply) => {
    const html = getIndexHtml();
    const transformed = await app.vite.transformIndexHtml(request.url, html);

    reply.type("text/html").send(transformed);
  });
});
