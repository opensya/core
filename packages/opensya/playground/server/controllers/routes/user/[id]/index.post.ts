import authorize from "@@/modules/access/server/controllers/transformers/authorize";
import { defineRoute } from "@core/server";

export default defineRoute(
  async (request) => {
    const { id } = request.params as { id: string };
    const body = request.body as typeof tables.users.$inferInsert;

    return await updateUser(id, body);
  },

  {
    schema: {
      params: {
        type: "object",
        required: ["id"],
        properties: {
          id: { type: "string" },
        },
      },

      body: {
        type: "object",
      },
    },
  },

  authorize("member:update"),
);
