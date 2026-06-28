import { fileService } from "../../../tools";
import { defineRoute } from "@core/server";

export default defineRoute(
  async (request) => {
    const body = request.body as {
      name: string;
      mimeType: string;
      size: number;
      ownerId?: string;
      ownerType?: string;
    };

    return fileService.initUpload(body);
  },

  {
    publicRoute: true,
    schema: {
      body: {
        type: "object",
        required: ["name", "mimeType", "size"],
        properties: {
          name: { type: "string" },
          mimeType: { type: "string" },
          size: { type: "number" },
          ownerId: { type: "string" },
          ownerType: { type: "string" },
        },
      },
    },
  },
);
