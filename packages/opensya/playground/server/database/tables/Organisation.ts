import { validateDocFile } from "@@/modules/storage/server/tools";
import { string, uuid } from "@core/server";

export const id = uuid().primary().defaultRandom();
export const name = string()
  .require()
  .validate((name) => {
    if (typeof name === "undefined") return null;
    if (name.length === 0) return "Name cannot be empty";
    return null;
  });

export const logoId = uuid()
  .relation({
    to: "docFile.id",
    type: "one",

    alias: "logo",
    inverse: { alias: "organisations" },
  })
  .validate(async (fileId) => {
    if (typeof fileId === "undefined") return null;
    if (fileId === null) return null;

    await validateDocFile(fileId, {
      throw: true,
      allowedMimeTypes: ["image/png", "image/jpeg"],
    });

    return null;
  });
