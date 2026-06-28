import { db, ForbiddenError, NotFoundError, tables } from "@core/server";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import type { StorageAdapter } from "./storage_adapter";

export type InitUploadInput = {
  name: string;
  mimeType: string;
  size: number;
  ownerId?: string;
  ownerType?: string;
};

export class FileService {
  private storage: StorageAdapter;
  private bucket: string;

  constructor(storage: StorageAdapter, bucket: string) {
    this.storage = storage;
    this.bucket = bucket;
  }

  async initUpload(input: InitUploadInput) {
    const fileId = randomUUID();
    const ext = input.name.split(".").pop() ?? "";
    const slug = input.name.toLowerCase().replace(/[^a-z0-9.]/g, "-");
    const storageKey = `uploads/${fileId}/${slug}`;

    await db.insert(tables.docFile).values({
      id: fileId,
      name: input.name,
      slug,
      mimeType: input.mimeType,
      extension: ext,
      size: input.size,
      bucket: this.bucket,
      storageKey,
      provider: "minio",
      visibility: "private",
      status: "pending",
      ownerId: input.ownerId,
      ownerType: input.ownerType,
    });

    const presignedUrl = await this.storage.presignUpload({
      key: storageKey,
      mimeType: input.mimeType,
    });

    await db.insert(tables.docFileUploadSession).values({
      fileId,
      presignedUrl,
      expiresAt: new Date(Date.now() + 900_000),
    });

    return { fileId, presignedUrl, storageKey };
  }

  async confirmUpload(fileId: string) {
    const [row] = await db
      .select()
      .from(tables.docFile)
      .where(eq(tables.docFile.id, fileId))
      .limit(1);

    if (!row) throw new NotFoundError("File not found");
    if (row.status !== "pending")
      throw new ForbiddenError("File already confirmed");

    const exists = await this.storage.exists(row.storageKey);
    if (!exists) throw new NotFoundError("File not found in storage");

    await db
      .update(tables.docFile)
      .set({ status: "ready", uploadedAt: new Date() })
      .where(eq(tables.docFile.id, fileId));

    await db
      .update(tables.docFileUploadSession)
      .set({ completedAt: new Date() })
      .where(eq(tables.docFileUploadSession.fileId, fileId));

    return { fileId, status: "ready" };
  }

  async getDownloadUrl(fileId: string, expiresIn = 3600) {
    const [row] = await db
      .select()
      .from(tables.docFile)
      .where(eq(tables.docFile.id, fileId))
      .limit(1);

    if (!row) throw new NotFoundError("File not found");
    if (row.status !== "ready") throw new NotFoundError("File not ready");

    return this.storage.presignDownload({
      key: row.storageKey,
      expiresIn,
      visibility: row.visibility,
    });
  }

  async deleteFile(fileId: string) {
    const [row] = await db
      .select()
      .from(tables.docFile)
      .where(eq(tables.docFile.id, fileId))
      .limit(1);

    if (!row) throw new Error("File not found");

    await this.storage.delete(row.storageKey);

    await db
      .update(tables.docFile)
      .set({ status: "deleted", deletedAt: new Date() })
      .where(eq(tables.docFile.id, fileId));

    return { fileId, status: "deleted" };
  }
}
