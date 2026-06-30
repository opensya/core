import { boolean, date, string, text, uuid } from "@core/server";

export const id = uuid().defaultRandom().primary().require();

export const name = string({ length: 100 }).require();

export const slug = string({ length: 100 }).require().unique().index({
  name: "roles_slug_idx",
  unique: true,
});

export const description = text();

export const isSystem = boolean().require().default(false);

export const createdAt = date({ withTimezone: true }).require().defaultNow();
