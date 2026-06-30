import { defineRoute } from "@core/server";

export default defineRoute(
  async (request) => {
    const body = request.body as typeof tables.users.$inferInsert;
    return await updateUser(request.user.sub, body);
  },

  {
    schema: {
      body: {
        type: "object",
      },
    },
  },
);
