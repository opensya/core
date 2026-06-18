export default defineController(
  async () => {
    const service = useService('config.get');
    return await service();
  },
  { path: '/' },
);
