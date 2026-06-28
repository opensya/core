import { defineRoute } from "@core/server";
import { fileService } from "../../../../tools/storage";

export default defineRoute(
  async (request) => {
    const { id } = request.params as { id: string };

    return fileService.deleteFile(id);
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
    },
  },
);
