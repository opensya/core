import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "!./src/**/*.test.{js,jsx,ts,tsx}",
    "!./src/**/*.spec.{js,jsx,ts,tsx}",
  ],

  tsconfig: "./tsconfig.build.json",
  format: ["esm"],
  dts: false,
  sourcemap: true,
  clean: true,
  unbundle: true,

  css: { inject: true },

  deps: {
    // neverBundle: [
    //   /^\/?@(core|ui):/,

    //   "vite",
    //   "@vitejs/plugin-react",
    //   "esbuild",
    //   "lightningcss",
    //   "sass",
    //   "sass-embedded",
    //   "postcss",
    //   "immutable",
    // ],
    neverBundle: [/^[^./]/, /^\/?@(core|ui):/],
  },

  outExtensions: (ctx) => {
    return {
      js: ctx.format === "cjs" ? ".cjs" : ".js",
    };
  },
});
