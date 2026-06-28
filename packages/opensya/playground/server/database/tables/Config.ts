import { json, string, uuid } from "../../../../src/server";

export const id = uuid().primary();
export const name = string().require();
export const favicon = json<Record<string, unknown>>();
export const primaryColor = string();
export const colorMode = string();

export const logoId = uuid().relation({
  to: "docFile.id",
  type: "one",

  alias: "logo",
  inverse: { alias: "configs" },
});
