import { defineTable, string, uuid, timestamp } from "../../../../src/server";

export default defineTable({
  columns: {
    id: uuid().defaultRandom().primary().require(),

    userId: uuid().require(),
    // .references(() => user.id, { onDelete: "cascade" }),

    tokenHash: string().require(),

    expiresAt: timestamp().require(),
    revokedAt: timestamp(),
    createdAt: timestamp().defaultNow().require(),
  },
});
