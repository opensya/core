import { services, defineController } from "../../../src/server";

export default defineController(async () => {
  return await services.hello();
});
