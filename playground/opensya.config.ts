export default defineOpensyaConfig({
  template: 'core',

  server: {
    paths: {
      '@/*': ['./*'],
    },
  },

  client: {
    components: {
      prefix: 'o',
    },
  },
});
