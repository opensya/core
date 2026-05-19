export default defineController(
  async ({ req }) => {
    const config = await useService('config.get')();
    return config;
  },
  { public: true },
);
