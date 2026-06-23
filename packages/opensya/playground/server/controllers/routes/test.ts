import { services, defineRoute } from "../../../../src/server";
import requireRole from "../transformers/require_role";

export default defineRoute(
  async () => {
    return await services.hello();
  },
  {
    publicRoute: true,
  },

  requireRole(),
);
