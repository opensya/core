import fp from "fastify-plugin";
import middie from "@fastify/middie";
import { createServer, type ViteDevServer } from "vite";
import { getIndexHtml } from "./index-html.js";
import path from "node:path";
import fastifyStatic from "@fastify/static";

import vue from "@vitejs/plugin-vue";
import {
  viteRouterPlugin,
  viteComponentsPlugin,
  vitePluginsPlugin,
  viteComposablesPlugin,
  viteCssPlugin,
} from "./plugins/index.js";
import { getDirs } from "#core/utils/dirs.js";

declare module "fastify" {
  interface FastifyInstance {
    vite: ViteDevServer;
  }
}

export default fp(async (app) => {
  const isDev = process.env.NODE_ENV !== "production";
  const { CORE_DIR } = getDirs();

  if (isDev) {
    await app.register(middie);

    const viteServer = await createServer({
      root: process.cwd(),
      server: { middlewareMode: true },
      appType: "custom",
      plugins: [
        vue(),
        viteComponentsPlugin(),
        viteComposablesPlugin(),
        vitePluginsPlugin(),
        viteRouterPlugin(),
        viteCssPlugin(),
      ],

      resolve: {
        alias: {
          "#core/*": path.join(CORE_DIR, "./*"),
        },
      },
    });

    app.decorate("vite", viteServer);

    app.use((req, res, next) => {
      if (req.url?.startsWith("/api")) return next();
      return viteServer.middlewares(req, res, next);
    });

    app.addHook("onClose", async () => {
      await viteServer.close();
    });

    app.get("*", async (request, reply) => {
      try {
        const clientEntry = path.join(import.meta.dirname, "./app/main.ts");
        const html = getIndexHtml(path.relative(process.cwd(), clientEntry));
        const transformed = await viteServer.transformIndexHtml(
          request.url,
          html,
        );
        reply.type("text/html").send(transformed);
      } catch (err) {
        viteServer.ssrFixStacktrace(err as Error);
        throw err;
      }
    });
  } else {
    await app.register(fastifyStatic, {
      root: path.join(process.cwd(), "dist-app"),
    });

    app.get("*", async (request, reply) => {
      if (request.url.startsWith("/api")) return;
      return reply.sendFile("index.html");
    });
  }
});
