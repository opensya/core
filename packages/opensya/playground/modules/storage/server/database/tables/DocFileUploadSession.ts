import { string, uuid, date } from "@core/server";

export const id = uuid().primary().defaultRandom();
export const fileId = uuid().require();
export const presignedUrl = string().require();
export const expiresAt = date({ withTimezone: true }).require();
export const completedAt = date({ withTimezone: true });
export const createdAt = date({ withTimezone: true }).defaultNow();
