import { defineRoute } from "@core/server";
import { createReadStream, existsSync } from "node:fs";
import { join } from "node:path";
import { verifyUploadToken } from "../../../../../../tools/storage";

export default defineRoute(
  async (request, reply) => {
    const { id, slug } = request.params as { id: string; slug: string };
    const key = `uploads/${id}/${slug}`;

    const { token } = request.query as { token?: string };

    // Si pas de token → fichier public, on laisse passer
    // Si token présent → on vérifie
    if (token && !verifyUploadToken(key, token)) {
      throw new Error("Invalid or expired download token");
    }

    const destDir =
      process.env.STORAGE_LOCAL_BASE_DIR ?? join(process.cwd(), ".storage");
    const destFile = join(destDir, key);

    if (!existsSync(destFile)) {
      throw new Error("File not found");
    }

    return reply.send(createReadStream(destFile));
  },
  {
    publicRoute: true,
    schema: {
      params: {
        type: "object",
        required: ["id", "slug"],
        properties: {
          id: { type: "string" },
          slug: { type: "string" },
        },
      },
    },
  },
);
