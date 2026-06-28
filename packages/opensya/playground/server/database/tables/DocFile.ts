import { string, uuid, int, date, json, enumeration } from "@core/server";

// ─── Enums ───────────────────────────────────────────────────────────────────

const providers = ["s3", "minio", "r2", "local"] as const;

const visibilities = ["public", "private", "restricted"] as const;

const fileStatus = [
  "pending",
  "uploaded",
  "processing",
  "ready",
  "failed",
  "deleted",
] as const;

// ─── Colonnes ────────────────────────────────────────────────────────────────

export const id = uuid().primary().defaultRandom();

export const name = string().require();
export const slug = string().require();
export const mimeType = string().require();
export const extension = string();
export const size = int();
export const checksum = string();

export const provider = enumeration("provider", providers).require();
export const bucket = string().require();
export const storageKey = string().require();
export const region = string();

export const visibility = enumeration(
  "file_visibility",
  visibilities,
).require();
export const status = enumeration("status", fileStatus).require();

export const meta = json<Record<string, unknown>>();

export const ownerId = uuid();
export const ownerType = string();

export const uploadedAt = date({ withTimezone: true });
export const createdAt = date({ withTimezone: true }).defaultNow();
export const updatedAt = date({ withTimezone: true })
  .defaultNow()
  .$onUpdateFn(() => new Date());
export const deletedAt = date({ withTimezone: true });
