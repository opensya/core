import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteInitPlugin } from "./init";
import { viteTransformRouterPlugin } from "./tranform_router";
import { viteTransformStylePlugin } from "./tranform_style";
import type { Plugin } from "vite";
import { viteTransformProvidersPlugin } from "./transform_providers";
import { viteTransformGuardsPlugin } from "./transform_guards";

export function getPlugins(): Plugin[] {
  const plugins = [
    react(),

    viteInitPlugin(),
    viteTransformRouterPlugin(),
    viteTransformStylePlugin(),
    viteTransformProvidersPlugin(),
    viteTransformGuardsPlugin(),

    tailwindcss(),
  ];

  return plugins as Plugin[];
}
