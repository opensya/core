// routes/files/upload/[...key].ts
import { defineRoute } from "@core/server";
import { verifyUploadToken } from "@@/modules/storage/server/tools";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

export default defineRoute(
  async (request) => {
    const { id, slug } = request.params as { id: string; slug: string };
    const key = `uploads/${id}/${slug}`;

    const { token } = request.query as { token?: string };

    if (!token || !verifyUploadToken(key, token)) {
      throw new Error("Invalid or expired upload token");
    }

    const buffer = (await request.body) as Buffer;

    const storageDir =
      process.env.STORAGE_LOCAL_BASE_DIR ?? join(process.cwd(), ".storage");

    const destDir = join(storageDir, "uploads", id);
    const destFile = join(destDir, slug);

    await mkdir(destDir, { recursive: true });
    await writeFile(destFile, buffer);

    return { ok: true };
  },

  {
    publicRoute: true,
    config: { rawBody: true },

    schema: {
      params: {
        type: "object",
        required: ["id", "slug"],
        properties: {
          id: { type: "string" },
          slug: { type: "string" },
        },
      },
      querystring: {
        type: "object",
        required: ["token"],
        properties: {
          token: { type: "string" },
        },
      },
    },
  },
);
