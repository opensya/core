export default defineOpensyaConfig({
  // serverDir: '',
  // rootDir: 'src',
  template: 'core',

  server: {
    paths: {
      '@/*': ['./*'],
    },
  },
});
