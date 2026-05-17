export default defineOpensyaConfig({
  template: 'core',

  server: {
    paths: {
      '@/*': ['./*'],
    },
  },
});
