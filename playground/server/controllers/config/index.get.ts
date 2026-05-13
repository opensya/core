export default defineController(
  async ({ res }) => {
    const config = await useService('config.get')();
    res.send(config);
  },
  { public: true },
);
