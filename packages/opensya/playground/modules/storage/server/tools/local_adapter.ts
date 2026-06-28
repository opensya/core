import { createHmac, randomBytes } from "node:crypto";
import { existsSync, unlinkSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import type {
  StorageAdapter,
  UploadIntent,
  DownloadIntent,
} from "./storage_adapter";

const SECRET = process.env.SECRET_KEY ?? randomBytes(32).toString("hex");

export function signUploadToken(key: string): string {
  const expires = Date.now() + 900_000; // 15 min
  const payload = `${key}:${expires}`;
  const sig = createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${expires}.${sig}`;
}

export function verifyUploadToken(key: string, token: string): boolean {
  const [expires, sig] = token.split(".");
  if (!expires || !sig) return false;
  if (Date.now() > Number(expires)) return false;
  const expected = createHmac("sha256", SECRET)
    .update(`${key}:${expires}`)
    .digest("hex");
  return sig === expected;
}

export class LocalAdapter implements StorageAdapter {
  private baseDir: string;
  private baseUrl: string;

  constructor(baseDir: string, baseUrl: string) {
    this.baseDir = baseDir;
    this.baseUrl = baseUrl;
  }

  async presignUpload({ key }: UploadIntent) {
    await mkdir(this.baseDir, { recursive: true });
    // Retourne une URL locale que ton handler HTTP sert
    const token = signUploadToken(key);
    return `${this.baseUrl}/api/files/${key}?token=${token}`;
  }

  async presignDownload({ key, visibility }: DownloadIntent) {
    if (visibility === "public") {
      return `${this.baseUrl}/api/files/uploads/${key}`;
    }

    const token = signUploadToken(key);
    return `${this.baseUrl}/api/files/${key}?token=${token}`;
  }

  async exists(key: string) {
    return existsSync(join(this.baseDir, key));
  }

  async delete(key: string) {
    unlinkSync(join(this.baseDir, key));
  }
}
