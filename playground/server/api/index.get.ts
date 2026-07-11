import { defineRouteHandler } from "../../../src/plugins/api/helper";

export default defineRouteHandler(() => {
  return { hello: " yes" };
});
