export const nuxtConfigTemplate = `export default defineNuxtConfig({
  {modules}

  devtools: { enabled: true, },

  experimental: {
    asyncContext: true,
  },

  compatibilityDate: '2024-07-11',
});
`;
