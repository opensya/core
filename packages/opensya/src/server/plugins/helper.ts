import type { FastifyPluginCallback } from "fastify";
import fp, { type PluginMetadata } from "fastify-plugin";

export type PluginMeta = {
  name: string;
  file: string;
};

export function definePlugin(
  handler: FastifyPluginCallback,
  options?: PluginMetadata,
) {
  return fp(handler, options);
}
