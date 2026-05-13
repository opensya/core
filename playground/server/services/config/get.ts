export default defineService(async function () {
  const model = getModel('Config');
  let config = await model.findOne();
  if (!config) config = await model.create({ name: "Orgs' name" });

  return config;
});
