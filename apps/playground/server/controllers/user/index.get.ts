export default defineController(async () => {
  const service = useService("hello");
  return await service("hello");
}, {});
