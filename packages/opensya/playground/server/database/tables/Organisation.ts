import { string, uuid } from "../../../../src/server";

export const id = uuid().primary().defaultRandom();
export const name = string()
  .require()
  .validate((name) => {
    if (name.length === 0) return "Name cannot be empty";
    return null;
  });

export const logoId = uuid().relation({
  to: "docFile.id",
  type: "one",

  alias: "logo",
  inverse: { alias: "organisations" },
});
