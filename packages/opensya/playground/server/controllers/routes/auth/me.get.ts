import { defineRoute } from "../../../../../src/server";

export default defineRoute(
  async (request) => {
    return request.user;
  },

  {},
);
