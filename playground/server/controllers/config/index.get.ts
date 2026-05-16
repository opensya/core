export default defineController(
  async ({ req }) => {
    console.log(req.params);

    const config = await useService('config.get')();
    return config;
  },
  { public: true },
);
