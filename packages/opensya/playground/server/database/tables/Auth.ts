import { string, uuid, timestamp } from "../../../../src/server";

export const id = uuid().defaultRandom().primary().require();

export const userId = uuid().require();
//  .references(() => user.id, { onDelete ="cascade" })

export const tokenHash = string().require();

export const expiresAt = timestamp().require();
export const revokedAt = timestamp();
export const createdAt = timestamp().defaultNow().require();
