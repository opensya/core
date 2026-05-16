export default defineController(
  async () => {
    const config = await useService('config.get')();
    return config;
  },
  { public: true },
);
