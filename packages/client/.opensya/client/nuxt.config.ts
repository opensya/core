export default defineNuxtConfig(
  {
    srcDir: "../../client",
    buildDir: "./.nuxt",
    appDir: "./",
    ssr: false,
    compatibilityDate: "2026-06-18",

    devtools: {
      enabled: true
    },

    modules: [],

    components: [
      {
        path: "~/components/globals",
        global: true,
        prefix: "o"
      }
    ],

    nitro: {
      output: {
        dir: "./.nuxt"
      }
    }
  }
);