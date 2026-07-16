export default defineRouteHandler(async () => {
  const user = await database.engine.findOne("users", {});

  return { hello: "yes", user };
});
