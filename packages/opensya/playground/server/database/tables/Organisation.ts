import { string, uuid } from "../../../../src/server";

export const id = uuid().primary();
export const name = string()
  .require()
  .validate((name) => {
    if (name.length === 0) return "Name cannot be empty";

    return null;
  });
