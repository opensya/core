import crypto from "node:crypto";
import bcrypt from "bcryptjs";

export function createRefreshToken(): string {
  return crypto.randomBytes(64).toString("hex");
}

export async function hashRefreshToken(token: string): Promise<string> {
  return bcrypt.hash(token, 10);
}

export async function verifyRefreshToken(
  token: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(token, hash);
}

export function getRefreshTokenExpiration(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date;
}
