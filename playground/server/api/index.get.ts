export default defineRouteHandler(async (r) => {
  r.routeOptions.attachValidation;
  const user = await database.engine.findOne("users", {});

  return { hello: "yes", user };
});
