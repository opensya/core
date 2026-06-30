import { date, string, text, uuid } from "@core/server";

export const id = uuid().defaultRandom().primary().require();

export const name = string({ length: 50 }).require();

// Slug unique dans l'instance — utile pour les URLs et les checks programmatiques
export const slug = string({ length: 50 }).require().unique().index({
  name: "teams_slug_idx",
  unique: true,
});

export const description = text();

export const createdAt = date({ withTimezone: true }).require().defaultNow();
export const updatedAt = date({ withTimezone: true })
  .require()
  .defaultNow()
  .$onUpdateFn(() => new Date());
