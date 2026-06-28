// tools/storage/validate_file.ts
import { BadRequestError, db, NotFoundError, tables } from "@core/server";
import { eq } from "drizzle-orm";

export type FileValidationOptions = {
  maxSize?: number; // bytes, default 10MB
  allowedMimeTypes?: string[]; // ex: ["image/png", "image/jpeg"]
  allowedExtensions?: string[]; // ex: ["png", "jpg"]
  requireStatus?: "pending" | "ready" | "uploaded";
};

export type FileValidationError =
  | { code: "NOT_FOUND" }
  | { code: "TOO_LARGE"; actual: number; max: number }
  | { code: "INVALID_MIME_TYPE"; actual: string; allowed: string[] }
  | { code: "INVALID_EXTENSION"; actual: string; allowed: string[] }
  | { code: "INVALID_STATUS"; actual: string; expected: string };

export type FileValidationResult =
  | { ok: true; file: typeof tables.docFile.$inferSelect }
  | { ok: false; error: FileValidationError };

const DEFAULTS = {
  maxSize: 10 * 1024 * 1024, // 10MB
};

export async function validateDocFile(
  fileId: string,
  options: FileValidationOptions & { throw: true },
): Promise<typeof tables.docFile.$inferSelect>;

export async function validateDocFile(
  fileId: string,
  options?: FileValidationOptions & { throw?: false },
): Promise<FileValidationResult>;

export async function validateDocFile(
  fileId: string,
  options: FileValidationOptions & { throw?: boolean } = {},
): Promise<FileValidationResult | typeof tables.docFile.$inferSelect> {
  const shouldThrow = options.throw ?? false;
  const maxSize = options.maxSize ?? DEFAULTS.maxSize;
  const allowedMimeTypes = options.allowedMimeTypes;
  const allowedExtensions = options.allowedExtensions;
  const requireStatus = options.requireStatus ?? "ready";

  function fail(error: FileValidationError): never | FileValidationResult {
    if (shouldThrow) {
      switch (error.code) {
        case "NOT_FOUND":
          throw new NotFoundError("File not found");
        case "TOO_LARGE":
          throw new BadRequestError(
            `File too large: ${error.actual} > ${error.max}`,
          );
        case "INVALID_MIME_TYPE":
          throw new BadRequestError(`Invalid mime type: ${error.actual}`);
        case "INVALID_EXTENSION":
          throw new BadRequestError(`Invalid extension: ${error.actual}`);
        case "INVALID_STATUS":
          throw new BadRequestError(`File not ready: ${error.actual}`);
      }
    }
    return { ok: false, error };
  }

  const [file] = await db
    .select()
    .from(tables.docFile)
    .where(eq(tables.docFile.id, fileId))
    .limit(1);

  if (!file) return fail({ code: "NOT_FOUND" });
  if (file.status !== requireStatus)
    return fail({
      code: "INVALID_STATUS",
      actual: file.status,
      expected: requireStatus,
    });
  if (file.size && file.size > maxSize)
    return fail({ code: "TOO_LARGE", actual: file.size, max: maxSize });
  if (allowedMimeTypes && !allowedMimeTypes.includes(file.mimeType))
    return fail({
      code: "INVALID_MIME_TYPE",
      actual: file.mimeType,
      allowed: allowedMimeTypes,
    });
  if (
    allowedExtensions &&
    file.extension &&
    !allowedExtensions.includes(file.extension)
  )
    return fail({
      code: "INVALID_EXTENSION",
      actual: file.extension,
      allowed: allowedExtensions,
    });

  if (shouldThrow) return file;
  return { ok: true, file };
}
