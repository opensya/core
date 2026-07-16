import fp from "fastify-plugin";
import middie from "@fastify/middie";
import { createServer, type ViteDevServer } from "vite";
import { getIndexHtml } from "./index-html.js";
import path from "node:path";
import fastifyStatic from "@fastify/static";

import vue from "@vitejs/plugin-vue";
import {
  viteRoutesPlugin,
  viteComponentsPlugin,
  vitePluginsPlugin,
  viteComposablesPlugin,
  viteCssPlugin,
  viteRouterMiddlewaresPlugin,
  vitePageMetaPlugin,
  viteLayoutsPlugin,
} from "./plugins/index.js";
import { getDirs } from "@/utils/dirs.js";
import { getCustomConfigAliases } from "../../utils/get-config-alias.js";
import { normalizeDir } from "@/utils/normalize-dir.js";

declare module "fastify" {
  interface FastifyInstance {
    vite: ViteDevServer;
  }
}

export default fp(async (app) => {
  const isDev = process.env.NODE_ENV !== "production";
  const dirs = getDirs();

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
        viteRoutesPlugin(),
        viteCssPlugin(),
        viteRouterMiddlewaresPlugin(),
        vitePageMetaPlugin({ dev: isDev }).vite(),
        viteLayoutsPlugin(),
      ],

      resolve: {
        alias: {
          "@/*": normalizeDir(
            path.relative(process.cwd(), path.join(dirs.CORE_DIR, "./*")),
          ),

          "#server/*": normalizeDir(
            path.relative(
              process.cwd(),
              path.join(dirs.OUTPUT_DIR_SERVER, "./*"),
            ),
          ),
          "#app/*": normalizeDir(
            path.relative(
              process.cwd(),
              path.join(dirs.OUTPUT_DIR_CLIENT, "./*"),
            ),
          ),

          "~/*": normalizeDir(
            path.relative(
              process.cwd(),
              path.join(dirs.INPUT_DIR_CLIENT, "./*"),
            ),
          ),
          "~~/*": normalizeDir(
            path.relative(
              process.cwd(),
              path.join(dirs.INPUT_DIR_SERVER, "./*"),
            ),
          ),

          ...getCustomConfigAliases(),
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
        const clientEntry = normalizeDir(
          path.resolve(import.meta.dirname, "./app/main.js"),
        );

        const html = getIndexHtml(clientEntry);
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
