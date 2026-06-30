import { string, uuid } from "@core/server";

export const id = uuid().defaultRandom().primary().require();

export const resource = string({ length: 100 }).require();

export const action = string({ length: 100 }).require();

export const slug = string({ length: 200 })
  .require()
  .unique()
  .index({ name: "permissions_slug_idx", unique: true })
  .index((table, { uniqueIndex }) => [
    uniqueIndex("permissions_resource_action_idx").on(
      table.resource,
      table.action,
    ),
  ]);
