import { string, uuid, int, date } from "../../../../src/server";

export const id = uuid().primary().defaultRandom();
export const name = string();
export const data = string();
export const type = string();
export const size = int();

export const createdAt = date().defaultNow();
export const updatedAt = date({ mode: "string" })
  .defaultNow()
  .$onUpdateFn(() => new Date());
