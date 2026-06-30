import { string, uuid, date } from "../../../../src/server";

export const id = uuid().defaultRandom().primary().require();

export const userId = uuid().require().index();
//  .references(() => user.id, { onDelete ="cascade" })

export const tokenHash = string().require();

export const expiresAt = date().require();
export const revokedAt = date();
export const createdAt = date().defaultNow().require();
