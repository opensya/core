import { defineRoute } from "@core/server";
import { fileService } from "../../../../tools/storage";

export default defineRoute(
  async (request) => {
    const { id } = request.params as { id: string };
    const url = await fileService.getDownloadUrl(id);

    return { url };
  },

  {
    publicRoute: true,

    schema: {
      params: {
        type: "object",
        required: ["id"],
        properties: {
          id: { type: "string" },
        },
      },
    },
  },
);
